const { 
  initializeToken, 
  querySheet, 
  getSheetRange, 
  addRowToSheet,
  makeRange 
} = require('../services/feishuService');
const { commitToGitHub } = require('../services/githubService');
const { triggerVercelDeploy } = require('../services/vercelService');
const { syncGamesData } = require('../services/gamesSyncService');
const { FEISHU_CONFIG, GITHUB_CONFIG } = require('../config');

// 查询更新记录（分页）
async function getUpdateRecords(page = 1, pageSize = 10) {
  // 参数验证
  if (page < 1 || pageSize < 1 || pageSize > 100) {
    throw new Error("无效的分页参数。page >= 1, pageSize 1-100之间");
  }

  // 获取访问令牌
  await initializeToken();

  // 查询表格信息
  const book = await querySheet(FEISHU_CONFIG.UPDATE_RECORD_FILE_TOKEN);
  const sheetMeta = book.data.sheets[0];
  const sheetId = sheetMeta.sheet_id;
  const columnCount = sheetMeta.grid_properties.column_count;
  const rowCount = sheetMeta.grid_properties.row_count;

  // 获取表头数据（第1行）
  const dataHeader = await getSheetRange(
    FEISHU_CONFIG.UPDATE_RECORD_FILE_TOKEN,
    makeRange(sheetId, 1, columnCount, 1, 1)
  );

  // 获取所有数据行（从第2行开始，因为第1行是表头）
  const rowsData = await getSheetRange(
    FEISHU_CONFIG.UPDATE_RECORD_FILE_TOKEN,
    makeRange(sheetId, 1, columnCount, 2, rowCount)
  );

  // 清理表头，过滤掉空值和null
  const cleanHeaders = dataHeader[0].filter(
    (header) => header !== null && header !== undefined && header !== "" && header !== "null"
  );

  // 处理所有行数据
  const processedRows = rowsData.map((row, rowIndex) => {
    const obj = {
      _rowIndex: rowIndex + 2, // 实际行号（从2开始）
    };

    // 只处理有效的表头字段
    cleanHeaders.forEach((key, index) => {
      const originValue = row[index];
      let value = "";

      // 数据类型处理
      if (originValue !== null && originValue !== undefined && originValue !== "null") {
        if (typeof originValue === "string") {
          value = originValue.trim();
        } else {
          value = String(originValue);
        }
      }

      obj[key] = value;
    });

    return obj;
  });

  // 过滤掉完全空的行（除了_rowIndex外，所有字段都为空）
  const validRows = processedRows.filter((row) => {
    // 获取除了_rowIndex之外的所有值
    const dataValues = Object.entries(row)
      .filter(([key, _]) => key !== "_rowIndex")
      .map(([_, value]) => value);

    // 检查是否至少有一个非空值
    return dataValues.some(
      (val) => val !== "" && val !== null && val !== undefined && val !== "null"
    );
  });

  // 分页处理
  const totalRecords = validRows.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedRecords = validRows.slice(startIndex, endIndex);

  return {
    sheetInfo: {
      sheetId,
      columnCount,
      rowCount,
      validHeaders: cleanHeaders.length,
      totalRecords: totalRecords,
    },
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalPages: totalPages,
      totalRecords: totalRecords,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    headers: cleanHeaders,
    records: paginatedRecords,
  };
}

// 添加更新记录
async function addUpdateRecord({ operator, is_test_env, description }) {
  // 参数验证
  if (!operator) {
    throw new Error("operator 是必填项");
  }

  // 获取访问令牌
  await initializeToken();

  // 查询表格信息
  const book = await querySheet(FEISHU_CONFIG.UPDATE_RECORD_FILE_TOKEN);
  const sheetMeta = book.data.sheets[0];
  const sheetId = sheetMeta.sheet_id;
  const columnCount = sheetMeta.grid_properties.column_count;

  // 获取表头数据（第1行）
  const dataHeader = await getSheetRange(
    FEISHU_CONFIG.UPDATE_RECORD_FILE_TOKEN,
    makeRange(sheetId, 1, columnCount, 1, 1)
  );
  const cleanHeaders = dataHeader[0].filter(
    (header) => header !== null && header !== undefined && header !== "" && header !== "null"
  );

  // 构建新行数据，根据表头顺序填充
  const newRowData = [];
  const time = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Shanghai",
  });

  // 字段映射
  const fieldMapping = {
    更新时间: time,
    更新说明: description || "",
    操作人: operator || "",
    是否是测试环境: is_test_env ? "是" : "否",
  };

  // 按照表头顺序填充数据
  cleanHeaders.forEach((header) => {
    const value = fieldMapping[header] || "";
    newRowData.push(value);
  });

  // 确保数组长度与列数匹配
  while (newRowData.length < columnCount) {
    newRowData.push("");
  }

  // 添加新行到表格
  const result = await addRowToSheet(FEISHU_CONFIG.UPDATE_RECORD_FILE_TOKEN, sheetId, [newRowData]);

  // 执行后续操作：运行脚本和提交到 GitHub
  let scriptResult = null;
  let githubResult = null;
  let gamesJsonContent = null;
  let vercelResult = null;

  try {
    // 1. 同步游戏数据
    console.log("开始同步游戏数据...");
    scriptResult = await syncGamesData();
    gamesJsonContent = scriptResult.content;

    // 2. 根据环境选择仓库并提交到 GitHub
    const targetRepo = is_test_env ? GITHUB_CONFIG.TEST_REPO : GITHUB_CONFIG.PROD_REPO;
    console.log(`提交文件到 GitHub 仓库: ${targetRepo}...`);
    const commitMessage = `Update games.json - ${time} by ${operator}${description ? ` - ${description}` : ''}`;
    githubResult = await commitToGitHub(
      "src/contents/games.json",
      gamesJsonContent,
      commitMessage,
      targetRepo
    );

    // 3. 如果是正式环境，触发 Vercel 部署
    if (!is_test_env) {
      console.log("正式环境，触发 Vercel 部署...");
      vercelResult = await triggerVercelDeploy();
    }

    console.log("所有操作完成成功");
  } catch (error) {
    console.error("后续操作失败:", error);
    // 即使后续操作失败，也返回成功，但包含错误信息
  }

  return {
    addedRow: {
      update_time: time,
      description: description || "",
      operator,
      is_test_env: is_test_env ? "是" : "否",
    },
    environment: {
      isTestEnv: is_test_env,
      targetRepo: is_test_env ? GITHUB_CONFIG.TEST_REPO : GITHUB_CONFIG.PROD_REPO,
      deploymentTriggered: !is_test_env,
    },
    sheetInfo: {
      sheetId,
      updatedRange: result.updatedRange || "",
      updatedRows: result.updatedRows || 1,
    },
    scriptExecution: scriptResult
      ? {
          success: true,
          count: scriptResult.count,
          message: `同步完成，共处理 ${scriptResult.count} 个游戏数据`,
        }
      : {
          success: false,
          error: "游戏数据同步失败",
        },
    githubCommit: githubResult
      ? {
          success: true,
          repo: githubResult.repo,
          commitSha: githubResult.commitSha,
          commitUrl: githubResult.commitUrl,
          fileUrl: githubResult.url,
        }
      : {
          success: false,
          error: "GitHub 提交失败",
        },
    vercelDeploy: vercelResult
      ? {
          success: true,
          jobId: vercelResult.jobId,
          state: vercelResult.state,
          createdAt: vercelResult.createdAt,
        }
      : !is_test_env
      ? {
          success: false,
          error: "Vercel 部署触发失败",
        }
      : {
          success: true,
          message: "测试环境，跳过 Vercel 部署",
        },
    gamesJsonUpdated: !!gamesJsonContent,
  };
}

module.exports = {
  getUpdateRecords,
  addUpdateRecord,
};
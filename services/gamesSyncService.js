const { 
  initializeToken, 
  querySheet, 
  getSheetRange, 
  makeRange 
} = require('../services/feishuService');
const { FEISHU_CONFIG } = require('../config');

// 同步游戏数据
async function syncGamesData() {
  try {
    console.log("开始同步游戏数据...");

    // 获取访问令牌
    console.log("正在获取访问令牌...");
    await initializeToken();
    console.log("访问令牌获取成功");

    // 查询表格信息
    console.log("正在查询表格信息...");
    const book = await querySheet(FEISHU_CONFIG.GAMES_FILE_TOKEN);
    const sheetMeta = book.data.sheets[0];
    const sheetId = sheetMeta.sheet_id;
    const columnCount = sheetMeta.grid_properties.column_count;
    const rowCount = sheetMeta.grid_properties.row_count;
    console.log(`表格信息: sheetId=${sheetId}, 列数=${columnCount}, 行数=${rowCount}`);

    // 获取表头数据（第1行）
    console.log("正在获取表头数据...");
    const dataHeader = await getSheetRange(
      FEISHU_CONFIG.GAMES_FILE_TOKEN,
      makeRange(sheetId, 1, columnCount, 1, 1)
    );
    console.log(`表头数据获取成功，共 ${dataHeader[0].length} 列`);

    // 获取所有数据行（从第3行开始，跳过表头和空行）
    console.log("正在获取数据行...");
    const rowsData = await getSheetRange(
      FEISHU_CONFIG.GAMES_FILE_TOKEN,
      makeRange(sheetId, 1, columnCount, 3, rowCount)
    );
    console.log(`数据行获取成功，共 ${rowsData.length} 行`);

    // 过滤可用的行数据（第一列为"是"的行）
    const rowsDataAvailable = rowsData.filter(
      (row) => !row.every((cell) => cell === null || cell === "") && row[0] === "是"
    );
    console.log(`过滤后可用数据行: ${rowsDataAvailable.length} 行`);

    // 转换为对象数组
    console.log("正在转换数据格式...");
    const objectArray = rowsDataAvailable.map((row) => {
      const obj = {};
      dataHeader[0].forEach((key, index) => {
        const originValue = row[index];
        let value = originValue;

        // 数据类型处理
        switch (key) {
          case "id":
            value = String(originValue || "");
            break;
          case "features":
            value = originValue ? String(originValue).split(",") : [];
            break;
          default:
            value = originValue || "";
            break;
        }

        // 排除 is_export 字段
        if (key !== "is_export") {
          obj[key] = value;
        }
      });
      return obj;
    });

    // 生成 JSON 内容
    console.log("正在生成 JSON 内容...");
    const gamesContent = JSON.stringify(objectArray, null, 2);

    console.log(`✅ 同步完成，共处理 ${objectArray.length} 个游戏数据`);
    return {
      success: true,
      count: objectArray.length,
      content: gamesContent,
      metadata: {
        sheetId,
        columnCount,
        rowCount,
        totalRows: rowsData.length,
        validRows: rowsDataAvailable.length,
        processedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("❌ 同步游戏数据失败:", error);

    // 提供更详细的错误信息
    let errorMessage = "未知错误";
    if (error instanceof Error) {
      errorMessage = error.message;
      // 如果是网络错误，提供更友好的提示
      if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("timeout")) {
        errorMessage = "网络连接失败，请检查网络状态";
      } else if (errorMessage.includes("401") || errorMessage.includes("403")) {
        errorMessage = "认证失败，请检查 API 密钥配置";
      } else if (errorMessage.includes("404")) {
        errorMessage = "表格文件未找到，请检查表格文件配置";
      }
    }

    throw new Error(`同步游戏数据失败: ${errorMessage}`);
  }
}

module.exports = {
  syncGamesData,
};
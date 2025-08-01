const axios = require('axios');
const { FEISHU_CONFIG } = require('../config');

// 访问令牌管理
function makeAccessToken() {
  let _accessToken = "";
  return {
    set(token) {
      _accessToken = token;
    },
    get() {
      return _accessToken;
    },
  };
}

const accessToken = makeAccessToken();

// 飞书 HTTP 客户端
const feishuClient = axios.create({
  baseURL: "https://open.larksuite.com/open-apis",
});

feishuClient.interceptors.request.use((config) => {
  const token = accessToken.get();
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

feishuClient.interceptors.response.use((response) => {
  if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  if (response.data.code !== 0) {
    throw new Error(`Request failed: ${response.data.msg}`);
  }
  return response;
});

// Excel 列名转换
function getExcelColumnName(columnIndex) {
  columnIndex -= 1;
  let columnName = "";
  while (columnIndex >= 0) {
    const remainder = columnIndex % 26;
    columnName = String.fromCharCode(65 + remainder) + columnName;
    columnIndex = Math.floor(columnIndex / 26) - 1;
  }
  return columnName;
}

// 构建范围字符串
function makeRange(sheetId, startColumnId, endColumnId, startRowId, endRowId) {
  return `${sheetId}!${getExcelColumnName(startColumnId)}${startRowId}:${getExcelColumnName(endColumnId)}${endRowId}`;
}

// 获取租户访问令牌
async function getTenantAccessToken() {
  const res = await feishuClient.post("/auth/v3/tenant_access_token/internal", {
    app_id: FEISHU_CONFIG.APPID,
    app_secret: FEISHU_CONFIG.APPSECRET,
  });
  return res.data.tenant_access_token;
}

// 查询表格信息
async function querySheet(fileToken) {
  try {
    const res = await feishuClient.get(`/sheets/v3/spreadsheets/${fileToken}/sheets/query`);
    return res.data;
  } catch (error) {
    console.error('查询表格失败:', error);
    throw error;
  }
}

// 获取表格范围数据
async function getSheetRange(fileToken, range) {
  const res = await feishuClient.get(
    `/sheets/v2/spreadsheets/${fileToken}/values/${range}?valueRenderOption=ToString`
  );
  return res.data.data.valueRange.values;
}

// 添加行到表格
async function addRowToSheet(fileToken, sheetId, values) {
  const res = await feishuClient.post(
    `/sheets/v2/spreadsheets/${fileToken}/values_append`,
    {
      valueRange: {
        range: `${sheetId}!A:Z`,
        values: values,
      },
    }
  );
  return res.data;
}

// 初始化访问令牌
async function initializeToken() {
  const token = await getTenantAccessToken();
  accessToken.set(token);
  return token;
}

module.exports = {
  accessToken,
  feishuClient,
  getExcelColumnName,
  makeRange,
  getTenantAccessToken,
  querySheet,
  getSheetRange,
  addRowToSheet,
  initializeToken,
};
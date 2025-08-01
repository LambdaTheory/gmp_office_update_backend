const axios = require('axios');
const { VERCEL_CONFIG } = require('../config');

// 触发 Vercel 部署
async function triggerVercelDeploy() {
  try {
    const response = await axios.post(VERCEL_CONFIG.DEPLOY_HOOK);
    return {
      success: true,
      jobId: response.data?.job?.id,
      state: response.data?.job?.state,
      createdAt: response.data?.job?.createdAt,
    };
  } catch (error) {
    console.error("Vercel 部署触发失败:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Vercel 部署触发失败: ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`Vercel 部署触发失败: ${error.message || "未知错误"}`);
  }
}

module.exports = {
  triggerVercelDeploy,
};
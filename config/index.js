// 飞书表格配置
const FEISHU_CONFIG = {
  APPID: process.env.FEISHU_APPID || "cli_a698dd91f9a15010",
  APPSECRET: process.env.FEISHU_APPSECRET || "yr5RJYKTFzevhnBYxGK7DedhBv4QSyzt",
  UPDATE_RECORD_FILE_TOKEN: process.env.UPDATE_RECORD_FILE_TOKEN || "I4SRsIeOehU5sBtXQprlnAZWgEb",
  GAMES_FILE_TOKEN: process.env.GAMES_FILE_TOKEN || "JsPEsAfAQhyzHqtE29wlRSKfgEb",
};

// GitHub 配置
const GITHUB_CONFIG = {
  TOKEN: process.env.GITHUB_TOKEN || "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",
  USERNAME: process.env.GITHUB_USERNAME || "651109000@qq.com",
  TEST_REPO: process.env.TEST_REPO || "tjh19971228/gmp_office_my",
  PROD_REPO: process.env.PROD_REPO || "kun-g/gmp_office",
  API_BASE: "https://api.github.com",
};

// Vercel 配置
const VERCEL_CONFIG = {
  DEPLOY_HOOK: process.env.DEPLOY_HOOK_URL || "https://api.vercel.com/v1/integrations/deploy/prj_2lyRUdJlQtJHtGHBLORQH5AaR1N7/S6eHSWgGVo",
};

module.exports = {
  FEISHU_CONFIG,
  GITHUB_CONFIG,
  VERCEL_CONFIG,
};
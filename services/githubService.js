const axios = require('axios');
const { GITHUB_CONFIG } = require('../config');

// GitHub API 客户端
const githubClient = axios.create({
  baseURL: GITHUB_CONFIG.API_BASE,
  headers: {
    Authorization: `token ${GITHUB_CONFIG.TOKEN}`,
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "gmp-office-api",
  },
});

// 获取文件的当前 SHA
async function getFileSha(filePath, repo) {
  try {
    const response = await githubClient.get(`/repos/${repo}/contents/${filePath}`);
    return response.data.sha;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // 文件不存在
    }
    throw error;
  }
}

// 提交文件到 GitHub
async function commitToGitHub(filePath, content, commitMessage, repo) {
  try {
    // 获取当前文件的 SHA（如果存在）
    const currentSha = await getFileSha(filePath, repo);

    // Base64 编码内容
    const encodedContent = Buffer.from(content, "utf-8").toString("base64");

    // 准备提交数据
    const commitData = {
      message: commitMessage,
      content: encodedContent,
      committer: {
        name: "GMP Office API",
        email: GITHUB_CONFIG.USERNAME,
      },
      author: {
        name: "GMP Office API",
        email: GITHUB_CONFIG.USERNAME,
      },
    };

    // 如果文件已存在，需要提供 SHA
    if (currentSha) {
      commitData.sha = currentSha;
    }

    const response = await githubClient.put(`/repos/${repo}/contents/${filePath}`, commitData);

    return {
      success: true,
      sha: response.data.content.sha,
      url: response.data.content.html_url,
      commitSha: response.data.commit.sha,
      commitUrl: response.data.commit.html_url,
      repo: repo,
    };
  } catch (error) {
    console.error("GitHub 提交失败:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`GitHub 提交失败: ${error.response?.data?.message || error.message}`);
    }
    throw new Error(`GitHub 提交失败: ${error.message || "未知错误"}`);
  }
}

module.exports = {
  githubClient,
  getFileSha,
  commitToGitHub,
};
# Vercel 部署指南

## 部署步骤

### 1. 准备工作

确保你的项目已经推送到 GitHub 仓库。

### 2. 连接 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 "New Project"
4. 选择你的 GitHub 仓库

### 3. 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

```bash
# 基础配置
NODE_ENV=production

# 飞书配置
FEISHU_APPID=your_app_id
FEISHU_APPSECRET=your_app_secret
UPDATE_RECORD_FILE_TOKEN=your_update_record_token
GAMES_FILE_TOKEN=your_games_token

# GitHub 配置
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your_github_username
TEST_REPO=your_test_repo
PROD_REPO=your_prod_repo

# Vercel 配置
VERCEL_DEPLOY_HOOK=your_vercel_deploy_hook
```

### 4. 部署配置

项目已经包含了 `vercel.json` 配置文件，Vercel 会自动识别并使用。

### 5. 部署

点击 "Deploy" 按钮，Vercel 会自动构建和部署你的应用。

## 部署后的 API 端点

部署成功后，你的 API 将可以通过以下端点访问：

- **基础信息**: `https://your-project.vercel.app/`
- **健康检查**: `https://your-project.vercel.app/api/health`
- **查询更新记录**: `GET https://your-project.vercel.app/read-update-record`
- **添加更新记录**: `POST https://your-project.vercel.app/read-update-record`
- **同步游戏数据**: `GET https://your-project.vercel.app/api/games/sync`

## 注意事项

1. **环境变量**: 确保所有必要的环境变量都在 Vercel 中正确配置
2. **CORS 设置**: 如果需要从特定域名访问，可能需要调整 CORS 配置
3. **函数超时**: Vercel 免费版有 10 秒的函数执行时间限制
4. **冷启动**: 无服务器函数可能会有冷启动延迟

## 本地测试

在部署前，可以使用以下命令本地测试：

```bash
# 安装 Vercel CLI
npm i -g vercel

# 本地运行
vercel dev
```

## 监控和日志

1. 在 Vercel 控制台查看部署日志
2. 使用 Vercel 的 Functions 标签页查看函数执行日志
3. 设置错误监控和告警

## 自动部署

每次推送到 GitHub 主分支时，Vercel 会自动重新部署应用。

## 故障排除

### 常见问题

1. **环境变量未设置**: 检查 Vercel 项目设置中的环境变量
2. **函数超时**: 优化代码或考虑升级 Vercel 计划
3. **CORS 错误**: 检查 CORS 配置是否正确
4. **依赖问题**: 确保 `package.json` 中的依赖版本正确

### 调试技巧

1. 查看 Vercel 部署日志
2. 使用 `console.log` 添加调试信息
3. 测试单个 API 端点
4. 检查网络请求和响应
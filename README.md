# GMP Update Backend

一个基于 Express.js 的后端 API 项目，提供飞书表格操作、GitHub集成和Vercel部署功能。

## 功能特性

- ✅ Express.js 框架
- ✅ CORS 跨域支持
- ✅ Helmet 安全中间件
- ✅ Morgan 日志记录
- ✅ 环境变量配置
- ✅ 错误处理中间件
- ✅ 健康检查端点
- ✅ 飞书表格操作（查询/新增）
- ✅ 游戏数据同步
- ✅ GitHub 自动提交
- ✅ Vercel 自动部署

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 环境配置

复制 `.env` 文件并配置相关参数：

```bash
# 基础配置
NODE_ENV=development
PORT=3000

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

### 启动开发服务器

```bash
pnpm run dev
```

### 启动生产服务器

```bash
pnpm start
```

## API 端点

### 基础端点

- `GET /` - API 信息和端点列表
- `GET /api/health` - 健康检查

### 更新记录管理

- `GET /read-update-record` - 查询更新记录（支持分页）
- `POST /read-update-record` - 添加更新记录（触发完整工作流）

### 游戏数据管理

- `GET /api/games/sync` - 手动同步游戏数据

### 响应示例

```json
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 具体数据
  }
}
```

## 工作流程

当添加更新记录时，系统会自动执行以下流程：

1. **记录添加** - 将更新记录添加到飞书表格
2. **数据同步** - 从游戏数据表格同步最新数据
3. **GitHub提交** - 将生成的JSON文件提交到指定仓库
4. **部署触发** - 如果是正式环境，触发Vercel部署

## 项目结构

```
gmp_update_backend/
├── app.js                      # 主应用文件
├── package.json                # 项目配置
├── .env                       # 环境变量
├── .gitignore                 # Git 忽略文件
├── README.md                  # 项目说明
├── API.md                     # API 文档
├── config/
│   └── index.js              # 配置管理
├── services/
│   ├── feishuService.js      # 飞书API服务
│   ├── githubService.js      # GitHub API服务
│   ├── vercelService.js      # Vercel API服务
│   ├── gamesSyncService.js   # 游戏数据同步服务
│   └── updateRecordService.js # 更新记录服务
├── controllers/
│   └── updateRecordController.js # 更新记录控制器
└── routes/
    ├── updateRecords.js      # 更新记录路由
    └── games.js             # 游戏数据路由
```

## 开发指南

### 添加新路由

1. 在 `routes/` 目录下创建路由文件
2. 在 `controllers/` 目录下创建控制器
3. 在 `app.js` 中注册路由

### 添加新服务

1. 在 `services/` 目录下创建服务文件
2. 导出相关函数
3. 在控制器中引入使用

### 错误处理

项目已配置全局错误处理中间件，会自动捕获和处理错误。

## API 文档

详细的API文档请查看 [API.md](./API.md)

## 部署

### 开发环境

```bash
pnpm run dev
```

### 生产环境

1. 设置生产环境变量
2. 运行 `pnpm start`
3. 确保端口 3000 可访问

## 许可证

ISC
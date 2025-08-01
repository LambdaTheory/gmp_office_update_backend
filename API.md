# GMP Update Backend API 文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **Content-Type**: `application/json`

## API 端点

### 1. 健康检查

**GET** `/api/health`

检查服务器运行状态。

**响应示例:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. 查询更新记录

**GET** `/read-update-record`

查询飞书表格中的更新记录，支持分页。

**查询参数:**
- `page` (可选): 页码，默认为 1
- `pageSize` (可选): 每页数量，默认为 10

**请求示例:**
```
GET /read-update-record?page=1&pageSize=10
```

**响应示例:**
```json
{
  "success": true,
  "message": "查询成功",
  "data": {
    "records": [
      {
        "id": "1",
        "title": "更新标题",
        "description": "更新描述",
        "version": "1.0.0",
        "createTime": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### 3. 添加更新记录

**POST** `/read-update-record`

添加新的更新记录到飞书表格，并触发完整的工作流程。

**请求体:**
```json
{
  "title": "更新标题",
  "description": "更新描述", 
  "version": "1.0.0",
  "environment": "test"
}
```

**请求参数说明:**
- `title` (必填): 更新标题
- `description` (必填): 更新描述
- `version` (必填): 版本号
- `environment` (可选): 环境类型，`test` 或 `prod`，默认为 `test`

**响应示例:**
```json
{
  "success": true,
  "message": "更新记录添加成功，工作流程已完成",
  "data": {
    "recordId": "rec123456",
    "workflow": {
      "recordAdded": true,
      "gamesSynced": true,
      "githubCommitted": true,
      "vercelDeployed": false
    }
  }
}
```

### 4. 同步游戏数据

**GET** `/api/games/sync`

手动触发游戏数据同步，从飞书表格读取数据并生成 JSON 文件。

**响应示例:**
```json
{
  "success": true,
  "message": "游戏数据同步成功",
  "data": {
    "totalGames": 50,
    "syncTime": "2024-01-01T00:00:00.000Z",
    "filePath": "games.json"
  }
}
```

## 错误响应

所有 API 在出错时都会返回统一的错误格式：

```json
{
  "success": false,
  "message": "错误描述",
  "error": "详细错误信息"
}
```

**常见错误状态码:**
- `400` - 请求参数错误
- `401` - 认证失败
- `403` - 权限不足
- `404` - 资源不存在
- `500` - 服务器内部错误

## 工作流程

### 添加更新记录的完整流程

当调用 `POST /read-update-record` 时，系统会按以下顺序执行：

1. **参数验证** - 验证必填字段
2. **获取飞书令牌** - 获取访问令牌
3. **添加记录** - 将记录添加到飞书表格
4. **同步游戏数据** - 从游戏数据表格同步最新数据
5. **提交到 GitHub** - 将生成的 JSON 文件提交到指定仓库
6. **触发部署** - 如果是正式环境，触发 Vercel 部署

## 环境变量配置

项目需要以下环境变量：

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

## 使用示例

### 使用 curl 查询更新记录

```bash
curl -X GET "http://localhost:3000/read-update-record?page=1&pageSize=5"
```

### 使用 curl 添加更新记录

```bash
curl -X POST "http://localhost:3000/read-update-record" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "新功能上线",
    "description": "添加了用户管理功能",
    "version": "1.2.0",
    "environment": "prod"
  }'
```

### 使用 curl 同步游戏数据

```bash
curl -X GET "http://localhost:3000/api/games/sync"
```
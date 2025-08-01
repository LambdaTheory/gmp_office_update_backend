const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

// 导入路由
const updateRecordsRouter = require('./routes/updateRecords');
const gamesRouter = require('./routes/games');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全中间件
app.use(cors()); // 跨域中间件
app.use(morgan('combined')); // 日志中间件
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: true })); // 解析URL编码的请求体

// 根路由
app.get('/', (req, res) => {
  res.json({
    message: 'GMP Update Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      updateRecords: {
        query: 'GET /read-update-record',
        create: 'POST /read-update-record'
      },
      games: {
        sync: 'GET /api/games/sync'
      }
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API 路由
app.use('/api', updateRecordsRouter);
app.use('/api/games', gamesRouter);

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Update Records: http://localhost:${PORT}/read-update-record`);
  console.log(`🎮 Games Sync: http://localhost:${PORT}/api/games/sync`);
});

module.exports = app;
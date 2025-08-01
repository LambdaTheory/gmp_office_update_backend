const express = require('express');
const { getRecords, createRecord } = require('../controllers/updateRecordController');

const router = express.Router();

// 统一的更新记录端点
// GET /read-update-record - 查询更新记录
router.get('/read-update-record', getRecords);

// POST /read-update-record - 添加更新记录
router.post('/read-update-record', createRecord);

module.exports = router;
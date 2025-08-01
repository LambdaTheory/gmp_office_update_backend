const express = require('express');
const { syncGamesData } = require('../services/gamesSyncService');

const router = express.Router();

// 同步游戏数据
// GET /api/games/sync
router.get('/sync', async (req, res) => {
  try {
    const result = await syncGamesData();
    
    res.json({
      success: true,
      message: "游戏数据同步成功",
      data: result,
    });
  } catch (error) {
    console.error("同步游戏数据失败:", error);
    res.status(500).json({
      success: false,
      message: "同步游戏数据失败",
      error: error.message,
    });
  }
});

module.exports = router;
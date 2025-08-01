const { getUpdateRecords, addUpdateRecord } = require('../services/updateRecordService');

// 查询更新记录
const getRecords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await getUpdateRecords(page, pageSize);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("读取更新记录失败:", error);
    res.status(500).json({
      success: false,
      message: "读取更新记录失败",
      error: error.message,
    });
  }
};

// 添加更新记录
const createRecord = async (req, res) => {
  try {
    const { operator, is_test_env, description } = req.body;

    const result = await addUpdateRecord({ operator, is_test_env, description });

    res.json({
      success: true,
      message: "更新记录添加成功",
      data: result,
    });
  } catch (error) {
    console.error("添加更新记录失败:", error);
    res.status(500).json({
      success: false,
      message: "添加更新记录失败",
      error: error.message,
    });
  }
};

module.exports = {
  getRecords,
  createRecord,
};
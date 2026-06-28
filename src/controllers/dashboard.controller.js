const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const { getDashboardStats } = require('../services/dashboard.service');

const stats = asyncHandler(async (req, res) => {
  const data = await getDashboardStats(req.user._id);
  res.status(200).json(new ApiResponse(200, data));
});

module.exports = { stats };

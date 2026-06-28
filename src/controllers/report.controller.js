const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const { getReport } = require('../services/report.service');

const generate = asyncHandler(async (req, res) => {
  const { type = 'monthly', month, year } = req.query;
  const report = await getReport(req.user._id, {
    type,
    month: month ? parseInt(month) : undefined,
    year: year ? parseInt(year) : undefined,
  });
  res.status(200).json(new ApiResponse(200, { report }));
});

module.exports = { generate };

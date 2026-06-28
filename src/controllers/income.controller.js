const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const incomeService = require('../services/income.service');
const { validate } = require('../utils/validation');
const {
  createIncomeSchema,
  updateIncomeSchema,
  incomeQuerySchema,
} = require('../validators/income.validator');

const create = asyncHandler(async (req, res) => {
  const data = validate(createIncomeSchema, req.body);
  const income = await incomeService.createIncome(req.user._id, data);
  res
    .status(201)
    .json(new ApiResponse(201, { income }, 'Income added successfully'));
});

const list = asyncHandler(async (req, res) => {
  const query = validate(incomeQuerySchema, req.query);
  const result = await incomeService.getIncomes(req.user._id, query);
  res.status(200).json(new ApiResponse(200, result));
});

const getById = asyncHandler(async (req, res) => {
  const income = await incomeService.getIncomeById(
    req.user._id,
    req.params.id
  );
  res.status(200).json(new ApiResponse(200, { income }));
});

const update = asyncHandler(async (req, res) => {
  const data = validate(updateIncomeSchema, req.body);
  const income = await incomeService.updateIncome(
    req.user._id,
    req.params.id,
    data
  );
  res
    .status(200)
    .json(new ApiResponse(200, { income }, 'Income updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await incomeService.deleteIncome(req.user._id, req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Income deleted successfully'));
});

module.exports = { create, list, getById, update, remove };

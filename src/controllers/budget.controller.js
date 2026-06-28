const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const budgetService = require('../services/budget.service');
const { validate } = require('../utils/validation');
const {
  createBudgetSchema,
  updateBudgetSchema,
} = require('../validators/budget.validator');

const create = asyncHandler(async (req, res) => {
  const data = validate(createBudgetSchema, req.body);
  const budget = await budgetService.createBudget(req.user._id, data);
  res
    .status(201)
    .json(new ApiResponse(201, { budget }, 'Budget created successfully'));
});

const list = asyncHandler(async (req, res) => {
  const budgets = await budgetService.getBudgets(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, { budgets }));
});

const getById = asyncHandler(async (req, res) => {
  const budget = await budgetService.getBudgetById(
    req.user._id,
    req.params.id
  );
  res.status(200).json(new ApiResponse(200, { budget }));
});

const update = asyncHandler(async (req, res) => {
  const data = validate(updateBudgetSchema, req.body);
  const budget = await budgetService.updateBudget(
    req.user._id,
    req.params.id,
    data
  );
  res
    .status(200)
    .json(new ApiResponse(200, { budget }, 'Budget updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await budgetService.deleteBudget(req.user._id, req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Budget deleted successfully'));
});

module.exports = { create, list, getById, update, remove };

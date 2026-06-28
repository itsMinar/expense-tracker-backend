const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const expenseService = require('../services/expense.service');
const { validate } = require('../utils/validation');
const {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
} = require('../validators/expense.validator');

const create = asyncHandler(async (req, res) => {
  const data = validate(createExpenseSchema, req.body);
  const expense = await expenseService.createExpense(req.user._id, data);
  res
    .status(201)
    .json(new ApiResponse(201, { expense }, 'Expense added successfully'));
});

const list = asyncHandler(async (req, res) => {
  const query = validate(expenseQuerySchema, req.query);
  const result = await expenseService.getExpenses(req.user._id, query);
  res.status(200).json(new ApiResponse(200, result));
});

const getById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(
    req.user._id,
    req.params.id
  );
  res.status(200).json(new ApiResponse(200, { expense }));
});

const update = asyncHandler(async (req, res) => {
  const data = validate(updateExpenseSchema, req.body);
  const expense = await expenseService.updateExpense(
    req.user._id,
    req.params.id,
    data
  );
  res
    .status(200)
    .json(new ApiResponse(200, { expense }, 'Expense updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.user._id, req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Expense deleted successfully'));
});

module.exports = { create, list, getById, update, remove };

const { asyncHandler } = require('../utils/asyncHandler');
const { ApiResponse } = require('../utils/ApiResponse');
const categoryService = require('../services/category.service');
const { validate } = require('../utils/validation');
const {
  createCategorySchema,
  updateCategorySchema,
} = require('../validators/category.validator');

const create = asyncHandler(async (req, res) => {
  const data = validate(createCategorySchema, req.body);
  const category = await categoryService.createCategory(req.user._id, data);
  res
    .status(201)
    .json(new ApiResponse(201, { category }, 'Category created successfully'));
});

const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.getCategories(
    req.user._id,
    req.query.type
  );
  res.status(200).json(new ApiResponse(200, { categories }));
});

const getById = asyncHandler(async (req, res) => {
  const category = await categoryService.getCategoryById(
    req.user._id,
    req.params.id
  );
  res.status(200).json(new ApiResponse(200, { category }));
});

const update = asyncHandler(async (req, res) => {
  const data = validate(updateCategorySchema, req.body);
  const category = await categoryService.updateCategory(
    req.user._id,
    req.params.id,
    data
  );
  res
    .status(200)
    .json(new ApiResponse(200, { category }, 'Category updated successfully'));
});

const remove = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.user._id, req.params.id);
  res
    .status(200)
    .json(new ApiResponse(200, null, 'Category deleted successfully'));
});

module.exports = { create, list, getById, update, remove };

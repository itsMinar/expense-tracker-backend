const Category = require('../models/category.model');
const CustomError = require('../utils/Error');

const createCategory = async (userId, data) => {
  const existing = await Category.findOne({ user: userId, name: data.name });
  if (existing) {
    throw CustomError.conflict({
      message: 'Category already exists',
      errors: ['A category with this name already exists'],
      hints: 'Please use a different name',
    });
  }
  return Category.create({ ...data, user: userId });
};

const getCategories = async (userId, type) => {
  const filter = { user: userId };
  if (type) filter.type = { $in: [type, 'both'] };
  return Category.find(filter).sort('name');
};

const getCategoryById = async (userId, categoryId) => {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) {
    throw CustomError.notFound({
      message: 'Category not found',
      errors: ['Category does not exist'],
      hints: 'Please check the category ID',
    });
  }
  return category;
};

const updateCategory = async (userId, categoryId, data) => {
  if (data.name) {
    const existing = await Category.findOne({
      user: userId,
      name: data.name,
      _id: { $ne: categoryId },
    });
    if (existing) {
      throw CustomError.conflict({
        message: 'Category name already exists',
        errors: ['A category with this name already exists'],
        hints: 'Please use a different name',
      });
    }
  }

  const category = await Category.findOneAndUpdate(
    { _id: categoryId, user: userId },
    data,
    { new: true, runValidators: true }
  );

  if (!category) {
    throw CustomError.notFound({
      message: 'Category not found',
      errors: ['Category does not exist'],
      hints: 'Please check the category ID',
    });
  }
  return category;
};

const deleteCategory = async (userId, categoryId) => {
  const category = await Category.findOneAndDelete({
    _id: categoryId,
    user: userId,
  });

  if (!category) {
    throw CustomError.notFound({
      message: 'Category not found',
      errors: ['Category does not exist'],
      hints: 'Please check the category ID',
    });
  }
  return category;
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};

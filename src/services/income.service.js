const Income = require('../models/income.model');
const CustomError = require('../utils/Error');

const createIncome = async (userId, data) => {
  const income = await Income.create({ ...data, user: userId });
  return income.populate('category');
};

const getIncomes = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    sort = '-date',
    search,
    category,
    startDate,
    endDate,
  } = query;

  const filter = { user: userId };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { source: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) filter.category = category;

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [incomes, total] = await Promise.all([
    Income.find(filter)
      .populate('category')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Income.countDocuments(filter),
  ]);

  return {
    incomes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getIncomeById = async (userId, incomeId) => {
  const income = await Income.findOne({ _id: incomeId, user: userId }).populate('category');
  if (!income) {
    throw CustomError.notFound({
      message: 'Income not found',
      errors: ['Income does not exist'],
      hints: 'Please check the income ID',
    });
  }
  return income;
};

const updateIncome = async (userId, incomeId, data) => {
  const income = await Income.findOneAndUpdate(
    { _id: incomeId, user: userId },
    data,
    { new: true, runValidators: true }
  ).populate('category');

  if (!income) {
    throw CustomError.notFound({
      message: 'Income not found',
      errors: ['Income does not exist'],
      hints: 'Please check the income ID',
    });
  }
  return income;
};

const deleteIncome = async (userId, incomeId) => {
  const income = await Income.findOneAndDelete({
    _id: incomeId,
    user: userId,
  });

  if (!income) {
    throw CustomError.notFound({
      message: 'Income not found',
      errors: ['Income does not exist'],
      hints: 'Please check the income ID',
    });
  }
  return income;
};

module.exports = {
  createIncome,
  getIncomes,
  getIncomeById,
  updateIncome,
  deleteIncome,
};

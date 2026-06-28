const Expense = require('../models/expense.model');
const CustomError = require('../utils/Error');

const createExpense = async (userId, data) => {
  const expense = await Expense.create({ ...data, user: userId });
  return expense.populate('category');
};

const getExpenses = async (userId, query) => {
  const {
    page = 1,
    limit = 10,
    sort = '-date',
    search,
    category,
    startDate,
    endDate,
    paymentMethod,
    tags,
    minAmount,
    maxAmount,
  } = query;

  const filter = { user: userId };

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) filter.category = category;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (tags) filter.tags = { $in: tags.split(',') };

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (minAmount || maxAmount) {
    filter.amount = {};
    if (minAmount) filter.amount.$gte = minAmount;
    if (maxAmount) filter.amount.$lte = maxAmount;
  }

  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('category')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Expense.countDocuments(filter),
  ]);

  return {
    expenses,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

const getExpenseById = async (userId, expenseId) => {
  const expense = await Expense.findOne({ _id: expenseId, user: userId }).populate('category');
  if (!expense) {
    throw CustomError.notFound({
      message: 'Expense not found',
      errors: ['Expense does not exist'],
      hints: 'Please check the expense ID',
    });
  }
  return expense;
};

const updateExpense = async (userId, expenseId, data) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: expenseId, user: userId },
    data,
    { new: true, runValidators: true }
  ).populate('category');

  if (!expense) {
    throw CustomError.notFound({
      message: 'Expense not found',
      errors: ['Expense does not exist'],
      hints: 'Please check the expense ID',
    });
  }
  return expense;
};

const deleteExpense = async (userId, expenseId) => {
  const expense = await Expense.findOneAndDelete({
    _id: expenseId,
    user: userId,
  });

  if (!expense) {
    throw CustomError.notFound({
      message: 'Expense not found',
      errors: ['Expense does not exist'],
      hints: 'Please check the expense ID',
    });
  }
  return expense;
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};

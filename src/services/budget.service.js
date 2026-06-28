const Budget = require('../models/budget.model');
const Expense = require('../models/expense.model');
const CustomError = require('../utils/Error');

const createBudget = async (userId, data) => {
  const existing = await Budget.findOne({
    user: userId,
    category: data.category,
    month: data.month,
    year: data.year,
  });

  if (existing) {
    throw CustomError.conflict({
      message: 'Budget already exists',
      errors: ['A budget for this category and period already exists'],
      hints: 'Please update the existing budget instead',
    });
  }

  return Budget.create({ ...data, user: userId });
};

const getBudgets = async (userId, query) => {
  const { month, year } = query;
  const filter = { user: userId };

  if (month) filter.month = parseInt(month);
  if (year) filter.year = parseInt(year);

  const budgets = await Budget.find(filter).populate('category').sort('category');

  const now = new Date();
  const currentMonth = month || now.getMonth() + 1;
  const currentYear = year || now.getFullYear();

  const budgetsWithProgress = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await Expense.aggregate([
        {
          $match: {
            user: budget.user,
            category: budget.category._id,
            $expr: {
              $and: [
                { $eq: [{ $month: '$date' }, currentMonth] },
                { $eq: [{ $year: '$date' }, currentYear] },
              ],
            },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]);

      const spentAmount = spent.length > 0 ? spent[0].total : 0;
      const percentage = budget.amount > 0 ? (spentAmount / budget.amount) * 100 : 0;

      return {
        ...budget.toObject(),
        spent: spentAmount,
        remaining: budget.amount - spentAmount,
        percentage: Math.round(percentage * 100) / 100,
        isOverBudget: spentAmount > budget.amount,
      };
    })
  );

  return budgetsWithProgress;
};

const getBudgetById = async (userId, budgetId) => {
  const budget = await Budget.findOne({ _id: budgetId, user: userId }).populate('category');
  if (!budget) {
    throw CustomError.notFound({
      message: 'Budget not found',
      errors: ['Budget does not exist'],
      hints: 'Please check the budget ID',
    });
  }
  return budget;
};

const updateBudget = async (userId, budgetId, data) => {
  const budget = await Budget.findOneAndUpdate(
    { _id: budgetId, user: userId },
    data,
    { new: true, runValidators: true }
  ).populate('category');

  if (!budget) {
    throw CustomError.notFound({
      message: 'Budget not found',
      errors: ['Budget does not exist'],
      hints: 'Please check the budget ID',
    });
  }
  return budget;
};

const deleteBudget = async (userId, budgetId) => {
  const budget = await Budget.findOneAndDelete({
    _id: budgetId,
    user: userId,
  });

  if (!budget) {
    throw CustomError.notFound({
      message: 'Budget not found',
      errors: ['Budget does not exist'],
      hints: 'Please check the budget ID',
    });
  }
  return budget;
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};

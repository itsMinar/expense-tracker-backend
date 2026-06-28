const Expense = require('../models/expense.model');
const Income = require('../models/income.model');
const Budget = require('../models/budget.model');

const getDashboardStats = async (userId) => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth, 1);

  const [
    totalExpenses,
    totalIncomes,
    monthlyExpenses,
    monthlyIncomes,
    expenseBreakdown,
    incomeBreakdown,
    weeklySpending,
    budgets,
  ] = await Promise.all([
    Expense.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Income.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Income.aggregate([
      {
        $match: {
          user: userId,
          date: { $gte: startOfMonth, $lt: startOfNextMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]),
    Income.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: { $dayOfWeek: '$date' },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Budget.find({ user: userId, month: currentMonth, year: currentYear }),
  ]);

  const totalExpense = totalExpenses[0]?.total || 0;
  const totalIncome = totalIncomes[0]?.total || 0;
  const monthlyExpense = monthlyExpenses[0]?.total || 0;
  const monthlyIncome = monthlyIncomes[0]?.total || 0;
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const dayOfMonth = now.getDate();
  const expectedDailyRate = totalBudget > 0 ? totalBudget / daysInMonth : 0;
  const spendingRate =
    expectedDailyRate > 0
      ? Math.round((monthlyExpense / (expectedDailyRate * dayOfMonth)) * 100)
      : 0;

  const monthlyExpensesData = await getMonthlyData(
    Expense,
    userId,
    currentYear
  );
  const monthlyIncomesData = await getMonthlyData(
    Income,
    userId,
    currentYear
  );

  return {
    totalBalance: totalIncome - totalExpense,
    totalIncome,
    totalExpense,
    monthlySavings: monthlyIncome - monthlyExpense,
    monthlyIncome,
    monthlyExpense,
    budgetLeft: totalBudget - monthlyExpense,
    spendingRate: Math.min(spendingRate, 100),
    totalBudget,
    expenseBreakdown,
    incomeBreakdown,
    weeklySpending,
    monthlyExpenses: monthlyExpensesData,
    monthlyIncomes: monthlyIncomesData,
  };
};

const getMonthlyData = async (Model, userId, year) => {
  const data = await Model.aggregate([
    {
      $match: {
        user: userId,
        date: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$date' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const months = Array.from({ length: 12 }, (_, i) => {
    const monthData = data.find((d) => d._id === i + 1);
    return {
      month: i + 1,
      total: monthData?.total || 0,
      count: monthData?.count || 0,
    };
  });

  return months;
};

module.exports = { getDashboardStats };

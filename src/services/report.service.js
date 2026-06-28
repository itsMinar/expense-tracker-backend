const Expense = require('../models/expense.model');
const Income = require('../models/income.model');

const getReport = async (userId, { type, month, year }) => {
  const now = new Date();
  const reportMonth = month || now.getMonth() + 1;
  const reportYear = year || now.getFullYear();

  let startDate, endDate;

  switch (type) {
    case 'weekly':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 7);
      break;
    case 'monthly':
      startDate = new Date(reportYear, reportMonth - 1, 1);
      endDate = new Date(reportYear, reportMonth, 1);
      break;
    case 'yearly':
      startDate = new Date(reportYear, 0, 1);
      endDate = new Date(reportYear + 1, 0, 1);
      break;
    default:
      startDate = new Date(reportYear, reportMonth - 1, 1);
      endDate = new Date(reportYear, reportMonth, 1);
  }

  const [expenses, incomes] = await Promise.all([
    Expense.find({
      user: userId,
      date: { $gte: startDate, $lt: endDate },
    })
      .populate('category')
      .sort('-date'),
    Income.find({
      user: userId,
      date: { $gte: startDate, $lt: endDate },
    })
      .populate('category')
      .sort('-date'),
  ]);

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

  const expenseByCategory = expenses.reduce((acc, expense) => {
    const catName = expense.category?.name || 'Uncategorized';
    if (!acc[catName]) acc[catName] = 0;
    acc[catName] += expense.amount;
    return acc;
  }, {});

  const incomeByCategory = incomes.reduce((acc, income) => {
    const catName = income.category?.name || 'Uncategorized';
    if (!acc[catName]) acc[catName] = 0;
    acc[catName] += income.amount;
    return acc;
  }, {});

  return {
    type,
    period: { startDate, endDate },
    summary: {
      totalIncome,
      totalExpense,
      netSavings: totalIncome - totalExpense,
      transactionCount: expenses.length + incomes.length,
    },
    expenses,
    incomes,
    expenseByCategory,
    incomeByCategory,
  };
};

module.exports = { getReport };

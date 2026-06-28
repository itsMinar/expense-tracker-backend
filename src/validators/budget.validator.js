const { z } = require('zod');

const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Budget amount must be positive'),
  month: z.number().min(1).max(12),
  year: z.number().min(2020).max(2100),
});

const updateBudgetSchema = createBudgetSchema.partial();

module.exports = { createBudgetSchema, updateBudgetSchema };

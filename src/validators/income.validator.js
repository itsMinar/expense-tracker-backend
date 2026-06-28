const { z } = require('zod');

const createIncomeSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  category: z.string().min(1, 'Category is required'),
  source: z.string().optional().default(''),
  date: z.string().optional(),
  notes: z.string().max(500).optional().default(''),
});

const updateIncomeSchema = createIncomeSchema.partial();

const incomeQuerySchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().max(100).optional().default(10),
  sort: z.string().optional().default('-date'),
  search: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

module.exports = {
  createIncomeSchema,
  updateIncomeSchema,
  incomeQuerySchema,
};

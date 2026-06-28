const { z } = require('zod');

const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().max(500).optional().default(''),
  category: z.string().min(1, 'Category is required'),
  date: z.string().optional(),
  paymentMethod: z
    .enum(['cash', 'credit_card', 'debit_card', 'bank_transfer', 'other'])
    .optional()
    .default('cash'),
  notes: z.string().max(500).optional().default(''),
  tags: z.array(z.string()).optional().default([]),
  recurring: z.boolean().optional().default(false),
});

const updateExpenseSchema = createExpenseSchema.partial();

const expenseQuerySchema = z.object({
  page: z.coerce.number().positive().optional().default(1),
  limit: z.coerce.number().positive().max(100).optional().default(10),
  sort: z.string().optional().default('-date'),
  search: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  tags: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
});

module.exports = {
  createExpenseSchema,
  updateExpenseSchema,
  expenseQuerySchema,
};

const { z } = require('zod');

const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  icon: z.string().optional().default('folder'),
  color: z.string().optional().default('#6b7280'),
  type: z.enum(['expense', 'income', 'both']).optional().default('expense'),
});

const updateCategorySchema = createCategorySchema.partial();

module.exports = { createCategorySchema, updateCategorySchema };

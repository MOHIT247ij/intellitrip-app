const { z } = require('zod');

const splitSchema = z.object({
  userId: z.number().int().positive().optional(),
  participantName: z.string().trim().optional(),
  shareAmount: z.number().min(0).optional(),
});

const createExpenseSchema = z
  .object({
    tripId: z.number().int().positive(),
    category: z.enum(['HOTEL', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER']),
    amount: z.number().positive(),
    description: z.string().max(255).optional(),
    splitEvenly: z.boolean().default(true),
    participants: z.array(z.string()).optional(),
    splits: z.array(splitSchema).optional(),
  })
  .refine((d) => d.splitEvenly || (d.splits && d.splits.length > 0), {
    message: 'Provide splits when splitEvenly is false',
    path: ['splits'],
  });

const updateExpenseSchema = z.object({
  category: z.enum(['HOTEL', 'FOOD', 'TRANSPORT', 'ACTIVITIES', 'SHOPPING', 'OTHER']).optional(),
  amount: z.number().positive().optional(),
  description: z.string().max(255).optional(),
});

module.exports = { createExpenseSchema, updateExpenseSchema };

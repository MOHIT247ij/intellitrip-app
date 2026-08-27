const { z } = require('zod');

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120).optional(),
  profileImage: z.string().url().optional().or(z.literal('')),
  language: z.enum(['en', 'hi', 'mr']).optional(),
  budgetPreference: z.enum(['BUDGET', 'MID_RANGE', 'LUXURY']).optional(),
  travelStyle: z.string().max(40).optional(),
  favouriteDestinations: z.array(z.string()).optional(),
  activities: z.array(z.string()).optional(),
  foodPreference: z.string().max(40).optional(),
  accommodationPreference: z.string().max(40).optional(),
  activityPreference: z.string().max(40).optional(),
});

module.exports = { updateProfileSchema };

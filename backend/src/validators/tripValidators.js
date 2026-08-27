const { z } = require('zod');

const planTripSchema = z.object({
  mode: z.enum(['structured', 'natural']).default('structured'),
  naturalLanguageInput: z.string().trim().max(1000).optional(),
  destination: z.string().trim().min(2).max(120).optional(),
  startLocation: z.string().trim().max(150).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  travellers: z.number().int().min(1).max(30).optional(),
  tripType: z.string().optional(),
  budget: z.number().positive().optional(),
  interests: z.array(z.string()).optional(),
  travelStyle: z.string().optional(),
  foodPreference: z.string().optional(),
  accommodationPreference: z.string().optional(),
  activityPreference: z.string().optional(),
  language: z.enum(['en', 'hi', 'mr']).default('en'),
});

const replanSchema = z.object({
  tripId: z.number().int().positive(),
  instruction: z.string().trim().min(3, 'Tell us what you would like to change').max(500),
});

const createTripSchema = z.object({
  title: z.string().trim().min(2).max(200),
  destinationId: z.number().int().positive().optional(),
  startLocation: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  travellers: z.number().int().min(1).default(1),
  tripType: z.string().optional(),
  budget: z.number().positive().optional(),
  currency: z.string().default('INR'),
});

const updateTripSchema = createTripSchema.partial().extend({
  status: z.enum(['DRAFT', 'PLANNED', 'ONGOING', 'COMPLETED', 'CANCELLED']).optional(),
});

module.exports = { planTripSchema, replanSchema, createTripSchema, updateTripSchema };

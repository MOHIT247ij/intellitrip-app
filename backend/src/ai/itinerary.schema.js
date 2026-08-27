/**
 * itinerary.schema.js
 * -----------------------------------------------------------------
 * The Zod contract that EVERY itinerary object must satisfy before
 * it is allowed to leave the backend — whether it came from Gemini,
 * the deterministic fallback generator, or a re-plan. This is what
 * "never trust raw AI output" looks like in code: Gemini returns
 * text; we JSON.parse it and then run it through this schema. If it
 * fails, ai.utils.js retries once with a corrective prompt; if it
 * still fails, the controller returns a controlled 502 error instead
 * of forwarding garbage to the frontend.
 * -----------------------------------------------------------------
 */
const { z } = require('zod');

const activitySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  category: z.string().min(1),
  startTime: z.string().optional(),
  durationMinutes: z.number().int().positive().max(1440),
  estimatedCost: z.number().min(0),
  isHiddenGem: z.boolean().optional().default(false),
});

const daySchema = z.object({
  day: z.number().int().positive(),
  title: z.string().min(1),
  activities: z.array(activitySchema).min(1),
});

const itinerarySchema = z.object({
  tripTitle: z.string().min(1),
  summary: z.string().min(1),
  destination: z.string().min(1),
  estimatedBudget: z.number().min(0),
  currency: z.string().default('INR'),
  days: z.array(daySchema).min(1),
  tips: z.array(z.string()).optional().default([]),
});

module.exports = { itinerarySchema, activitySchema, daySchema };

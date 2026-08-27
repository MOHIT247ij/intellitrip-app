/**
 * ai.utils.js
 * Small helpers shared by the AI layer: stripping Gemini's occasional
 * markdown code fences before JSON.parse, and the schema
 * validate-then-retry-once loop described in item 8 of the spec.
 */
const { itinerarySchema } = require('./itinerary.schema');

/** Gemini sometimes wraps JSON in ```json ... ``` even when told not to. Strip it. */
function extractJson(rawText) {
  if (!rawText) return null;
  let text = rawText.trim();
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) text = fenceMatch[1].trim();

  // If there's leading/trailing prose, grab the outermost {...}
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    text = text.slice(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

/**
 * validateItinerary — parses + validates raw model text against the
 * Zod schema. Returns { success, data } or { success: false, error }.
 * Never throws — callers decide whether to retry.
 */
function validateItinerary(rawText) {
  const parsed = extractJson(rawText);
  if (!parsed) {
    return { success: false, error: 'AI response was not valid JSON.' };
  }
  const result = itinerarySchema.safeParse(parsed);
  if (!result.success) {
    return { success: false, error: result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ') };
  }
  return { success: true, data: result.data };
}

module.exports = { extractJson, validateItinerary };

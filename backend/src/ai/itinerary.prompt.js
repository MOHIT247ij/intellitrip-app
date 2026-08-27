/**
 * itinerary.prompt.js
 * -----------------------------------------------------------------
 * Builds the exact text prompt sent to Gemini. Keeping prompt
 * construction in its own file (rather than inline in the service)
 * makes it easy to tune wording without touching API-call logic.
 * -----------------------------------------------------------------
 */

const JSON_SHAPE = `{
  "tripTitle": string,
  "summary": string,
  "destination": string,
  "estimatedBudget": number,
  "currency": "INR",
  "days": [
    {
      "day": number,
      "title": string,
      "activities": [
        {
          "name": string,
          "description": string,
          "location": string,
          "latitude": number | null,
          "longitude": number | null,
          "category": "Adventure" | "Nature" | "Beach" | "Food" | "Family" | "History" | "Shopping" | "Nightlife" | "Spiritual" | "Photography" | "Luxury",
          "startTime": string (e.g. "09:00 AM"),
          "durationMinutes": number,
          "estimatedCost": number,
          "isHiddenGem": boolean
        }
      ]
    }
  ],
  "tips": string[]
}`;

const LANGUAGE_NAMES = { en: 'English', hi: 'Hindi (हिन्दी)', mr: 'Marathi (मराठी)' };

/**
 * buildPlanPrompt — the RAG "generation" step. `context` is the text
 * block produced by rag/context-builder.js from real MySQL rows
 * (destination info, real places, real hidden gems with coordinates
 * and costs) — Gemini is instructed to build the itinerary FROM this
 * verified context rather than inventing places from nothing.
 */
function buildPlanPrompt({ request, context, language = 'en' }) {
  const languageName = LANGUAGE_NAMES[language] || 'English';

  return `You are IntelliTrip's AI travel planning engine. You generate structured, realistic, day-by-day travel itineraries for India.

## Verified destination knowledge (retrieved from our database — ground your plan in these real places, prefer them over invented ones)
${context}

## Traveller request
- Destination: ${request.destination}
- Starting location: ${request.startLocation || 'Not specified'}
- Trip duration: ${request.days} day(s) (${request.startDate || 'flexible'} to ${request.endDate || 'flexible'})
- Number of travellers: ${request.travellers || 1}
- Trip type: ${request.tripType || 'General leisure'}
- Total budget: ${request.budget ? `₹${request.budget}` : 'Not specified — suggest a reasonable budget'}
- Interests: ${(request.interests || []).join(', ') || 'Not specified'}
- Travel style: ${request.travelStyle || 'Not specified'}
- Food preference: ${request.foodPreference || 'No restriction'}
- Accommodation preference: ${request.accommodationPreference || 'Not specified'}
- Activity preference: ${request.activityPreference || 'Balanced mix'}
${request.naturalLanguageInput ? `- Additional free-text request from the traveller: "${request.naturalLanguageInput}"` : ''}

## Instructions
1. Build a day-by-day itinerary covering the full trip duration.
2. Prefer the verified places listed above. You may include at most 1-2 additional well-known places per day if needed to fill the schedule, but never fabricate obscure "hidden gems" that are not grounded in the provided context.
3. Include a genuine mix of popular attractions AND hidden gems from the context where relevant to the traveller's interests.
4. Order activities sensibly through the day (morning, afternoon, evening) with realistic startTime and durationMinutes.
5. estimatedCost values must be realistic in Indian Rupees for the described trip type.
6. Write the "summary", "tripTitle", activity "name" and "description" fields in ${languageName}. Keep JSON keys and category enum values in English exactly as specified.
7. Respond with ONLY valid JSON matching this exact shape — no markdown fences, no commentary, no trailing text:
${JSON_SHAPE}`;
}

/**
 * buildReplanPrompt — used by /api/ai/replan. Crucially, this sends
 * the EXISTING itinerary back to Gemini along with the requested
 * change, instructing it to modify rather than regenerate from zero.
 */
function buildReplanPrompt({ existingItinerary, instruction, context, language = 'en' }) {
  const languageName = LANGUAGE_NAMES[language] || 'English';
  return `You are IntelliTrip's AI travel planning engine. A traveller wants to MODIFY an existing itinerary — do not throw it away and start over. Keep everything that still makes sense and change only what the instruction requires.

## Current itinerary (JSON)
${JSON.stringify(existingItinerary)}

## Additional verified destination knowledge you may draw on for replacements
${context}

## Requested change
"${instruction}"

## Instructions
1. Apply the requested change (e.g. cheaper alternatives, add/remove a category of activity, reduce walking, adjust for weather, make it family-friendly) while preserving the parts of the itinerary that are unaffected.
2. Keep the same number of days unless the instruction explicitly asks to change trip length.
3. Recompute "estimatedBudget" to reflect the modified plan.
4. Write "summary", "tripTitle", activity "name"/"description" in ${languageName}.
5. Respond with ONLY valid JSON in this exact shape — no markdown fences, no commentary:
${JSON_SHAPE}`;
}

module.exports = { buildPlanPrompt, buildReplanPrompt, JSON_SHAPE };

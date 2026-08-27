/**
 * rag.service.js
 * -----------------------------------------------------------------
 * Orchestrates the full RAG pipeline described in the README:
 *
 *   User request
 *     -> retrieval.service.js  (query MySQL for destination + places)
 *     -> context-builder.js    (turn rows into grounding text)
 *     -> itinerary.prompt.js   (build the Gemini prompt)
 *     -> gemini.service.js     (call the LLM)
 *     -> ai.utils.js           (parse + Zod-validate the JSON)
 *     -> [retry once on failure] -> validate again
 *     -> controlled error if still invalid
 *
 * If Gemini is not configured (no API key), or every attempt fails
 * validation, we fall back to `buildDeterministicItinerary`, which
 * assembles a schema-valid itinerary directly from the retrieved
 * MySQL places (no LLM involved). This keeps the AI Planner usable
 * in a no-API-key classroom environment while remaining honest about
 * when a real generative call was used (`meta.source` in the
 * response tells the frontend which path was taken).
 * -----------------------------------------------------------------
 */
const geminiService = require('../ai/gemini.service');
const { buildPlanPrompt, buildReplanPrompt } = require('../ai/itinerary.prompt');
const { validateItinerary } = require('../ai/ai.utils');
const { retrieveDestinationContext, retrieveDestinationFromText } = require('./retrieval.service');
const { buildContext } = require('./context-builder');
const { geocodePlace } = require('../integrations/geocode.service');
const { findNearbyAttractions } = require('../integrations/overpass.service');
const logger = require('../config/logger');

const CATEGORY_LABELS = {
  ADVENTURE: 'Adventure',
  NATURE: 'Nature',
  BEACH: 'Beach',
  FOOD: 'Food',
  FAMILY: 'Family',
  HISTORY: 'History',
  SHOPPING: 'Shopping',
  NIGHTLIFE: 'Nightlife',
  SPIRITUAL: 'Spiritual',
  PHOTOGRAPHY: 'Photography',
  LUXURY: 'Luxury',
};

function toNum(v) {
  if (v == null) return 0;
  return typeof v.toNumber === 'function' ? v.toNumber() : Number(v);
}

// Generic (but genuinely varied) activity templates used when we have no
// seeded places for the requested destination — e.g. it isn't in our MySQL
// database yet. These keep the itinerary usable (real day-by-day cards,
// real "open in Google Maps" search links) instead of returning empty days.
function genericActivityTemplates(label) {
  return [
    { name: `Explore ${label} city center`, description: `Get your bearings with a walk through the main streets and squares of ${label}.`, category: 'Photography', durationMinutes: 120, cost: 500 },
    { name: `Visit a popular local landmark`, description: `Check out one of the most recommended sights in and around ${label}.`, category: 'History', durationMinutes: 150, cost: 800 },
    { name: `Local market & shopping`, description: `Browse a local market in ${label} for souvenirs, crafts, and everyday local life.`, category: 'Shopping', durationMinutes: 90, cost: 600 },
    { name: `Try regional cuisine`, description: `Sit down for a meal featuring dishes typical of ${label}.`, category: 'Food', durationMinutes: 75, cost: 700 },
    { name: `Evening leisure walk`, description: `Wind down in ${label} with a relaxed evening stroll and some free time.`, category: 'Nature', durationMinutes: 90, cost: 300 },
  ];
}

/**
 * Deterministic fallback: build a schema-valid itinerary, in three
 * tiers, so it works for ANY destination the traveller types — not
 * only the handful we've hand-seeded in MySQL:
 *   1) Our own verified MySQL places for this destination (best).
 *   2) Real nearby points of interest from OpenStreetMap's free
 *      Overpass API, around a free-geocoded center point — this is
 *      what makes any Indian (or world) city work out of the box.
 *   3) Generic travel-knowledge activity templates, placed at a
 *      jittered point near the geocoded center (or with no
 *      coordinates at all if even geocoding failed) — the last-resort
 *      safety net so a day is never left completely empty.
 */
async function buildDeterministicItinerary({ destination, places, days, travellers, budget, destinationName }) {
  const label = destination ? destination.name : (destinationName || 'your destination');
  const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '07:00 PM'];
  let totalCost = 0;

  // Tier 1: our own verified MySQL places.
  let sourcePlaces = places.map((place) => ({
    name: place.name,
    description: place.description,
    location: place.address || place.name,
    latitude: place.latitude != null ? Number(place.latitude) : null,
    longitude: place.longitude != null ? Number(place.longitude) : null,
    category: CATEGORY_LABELS[place.category] || 'Nature',
    durationMinutes: place.avgDurationMinutes || 90,
    estimatedCost: toNum(place.estimatedCost),
    isHiddenGem: place.isHiddenGem,
  }));
  let dataSource = destination ? 'db' : 'generic';

  let centerPoint = null;
  if (sourcePlaces.length === 0 && destinationName) {
    // No seeded places for this destination — find a real city-center
    // point via free OpenStreetMap geocoding (no API key needed).
    centerPoint = (await geocodePlace(`${destinationName}, India`)) || (await geocodePlace(destinationName));

    if (centerPoint) {
      // Tier 2: real nearby attractions from OpenStreetMap.
      const osmPlaces = await findNearbyAttractions({ latitude: centerPoint.latitude, longitude: centerPoint.longitude, label });
      if (osmPlaces.length > 0) {
        sourcePlaces = osmPlaces.map((p) => ({ ...p, location: label, isHiddenGem: false }));
        dataSource = 'osm';
      }
    }
  }

  // Tier 3 fallback data (only used if sourcePlaces is still empty below).
  const genericTemplates = genericActivityTemplates(label);
  const jitteredPoint = () => {
    if (!centerPoint) return { latitude: null, longitude: null };
    const jitter = () => (Math.random() - 0.5) * 0.03; // roughly ±1.5km
    return {
      latitude: Number((centerPoint.latitude + jitter()).toFixed(6)),
      longitude: Number((centerPoint.longitude + jitter()).toFixed(6)),
    };
  };

  const perDay = Math.max(1, Math.ceil(sourcePlaces.length / days) || 3);
  const dayList = [];
  let cursor = 0;

  for (let d = 1; d <= days; d += 1) {
    let activities;

    if (sourcePlaces.length > 0) {
      const dayPlaces = sourcePlaces.slice(cursor, cursor + perDay);
      cursor += perDay;
      if (dayPlaces.length === 0) break;

      activities = dayPlaces.map((place, idx) => {
        const cost = toNum(place.estimatedCost) * (travellers || 1);
        totalCost += cost;
        return {
          name: place.name,
          description: place.description,
          location: place.location,
          latitude: place.latitude,
          longitude: place.longitude,
          category: place.category,
          startTime: times[idx % times.length],
          durationMinutes: place.durationMinutes,
          estimatedCost: cost,
          isHiddenGem: place.isHiddenGem,
        };
      });
    } else {
      // Last resort — still build a real, usable day instead of leaving
      // it empty. If geocoding found a center point, each activity gets a
      // real (jittered) lat/lng so the map shows pins; if not, the
      // frontend falls back to a name-based Google Maps search link.
      activities = genericTemplates.map((tpl, idx) => {
        const cost = tpl.cost * (travellers || 1);
        totalCost += cost;
        const { latitude, longitude } = jitteredPoint();
        return {
          name: tpl.name,
          description: tpl.description,
          location: label,
          latitude,
          longitude,
          category: tpl.category,
          startTime: times[idx % times.length],
          durationMinutes: tpl.durationMinutes,
          estimatedCost: cost,
          isHiddenGem: false,
        };
      });
    }

    dayList.push({
      day: d,
      title: `${destination ? destination.name : label} — Day ${d}`,
      activities,
    });
  }

  const SUMMARIES = {
    db: `A ${days}-day itinerary for ${label} built from verified local places, mixing popular attractions with hidden gems.`,
    osm: `A ${days}-day itinerary for ${label} built from real nearby points of interest, since ${label} isn't in our own verified places database yet.`,
    generic: `A ${days}-day itinerary for ${label} built from general travel knowledge (no matching destination or nearby points of interest found).`,
  };
  const TIPS = {
    db: 'This itinerary was generated in deterministic fallback mode because no Gemini API key is configured.',
    osm: `We don't have ${label} in our own verified database yet, so this itinerary uses real nearby places from OpenStreetMap instead.`,
    generic: `We couldn't find verified places or nearby points of interest for ${label}, so this itinerary uses general travel activities instead of exact local spots.`,
  };

  return {
    tripTitle: `${label} Adventure — ${days} Day${days > 1 ? 's' : ''}`,
    summary: SUMMARIES[dataSource],
    destination: destination ? destination.name : (destinationName || 'India'),
    estimatedBudget: budget || Math.round(totalCost) || 5000 * days,
    currency: 'INR',
    days: dayList,
    tips: [
      TIPS[dataSource],
      'Carry a mix of cash and UPI for smaller vendors and hidden-gem locations.',
    ],
  };
}

/**
 * plan — main entry point for POST /api/ai/plan
 * `request` shape: { destination, startLocation, days, startDate, endDate,
 *   travellers, tripType, budget, interests[], travelStyle, foodPreference,
 *   accommodationPreference, activityPreference, naturalLanguageInput, language }
 */
async function plan(request) {
  let destinationName = request.destination;

  // Natural-language mode: try to infer the destination from free text if not explicitly given
  if (!destinationName && request.naturalLanguageInput) {
    const inferred = await retrieveDestinationFromText(request.naturalLanguageInput);
    destinationName = inferred?.name;
  }

  const { destination, places } = await retrieveDestinationContext({
    destinationName,
    interests: request.interests || [],
  });

  const context = buildContext({ destination, places });
  const days = request.days || 3;

  if (!geminiService.isConfigured()) {
    logger.warn('Gemini not configured — using deterministic RAG fallback itinerary.');
    const fallback = await buildDeterministicItinerary({ destination, places, days, travellers: request.travellers, budget: request.budget, destinationName });
    return { itinerary: fallback, source: 'fallback-template', destination, places };
  }

  const prompt = buildPlanPrompt({ request: { ...request, destination: destinationName || request.destination || 'India' }, context, language: request.language });

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const raw = await geminiService.generateContent(
        attempt === 1 ? prompt : `${prompt}\n\nIMPORTANT: Your previous response failed JSON schema validation. Return ONLY strictly valid JSON matching the exact shape requested, with no markdown fences or commentary.`
      );
      const validation = validateItinerary(raw);
      if (validation.success) {
        return { itinerary: validation.data, source: 'gemini', destination, places };
      }
      logger.warn(`Gemini itinerary failed validation on attempt ${attempt}: ${validation.error}`);
    } catch (err) {
      logger.error(`Gemini call failed on attempt ${attempt}: ${err.message}`);
    }
  }

  // Both attempts failed — fall back rather than sending bad data to the client
  logger.warn('Falling back to deterministic itinerary after Gemini failures.');
  const fallback = await buildDeterministicItinerary({ destination, places, days, travellers: request.travellers, budget: request.budget, destinationName });
  return { itinerary: fallback, source: 'fallback-after-error', destination, places };
}

/**
 * replan — main entry point for POST /api/ai/replan.
 * Sends the EXISTING itinerary + instruction back to Gemini so it
 * modifies rather than regenerates.
 */
async function replan({ existingItinerary, instruction, language = 'en' }) {
  const destinationName = existingItinerary.destination;
  const { destination, places } = await retrieveDestinationContext({ destinationName, interests: [] });
  const context = buildContext({ destination, places });

  if (!geminiService.isConfigured()) {
    // Fallback re-plan: apply a couple of simple, explainable heuristics directly.
    const cheaper = /cheap|budget|reduce cost|lower cost/i.test(instruction);
    const modified = JSON.parse(JSON.stringify(existingItinerary));
    if (cheaper) {
      modified.days.forEach((day) => {
        day.activities.forEach((a) => {
          a.estimatedCost = Math.round(a.estimatedCost * 0.7);
        });
      });
      modified.estimatedBudget = Math.round(modified.estimatedBudget * 0.7);
    }
    modified.tips = [...(modified.tips || []), `Re-plan applied in fallback mode for instruction: "${instruction}" (no Gemini API key configured).`];
    return { itinerary: modified, source: 'fallback-template' };
  }

  const prompt = buildReplanPrompt({ existingItinerary, instruction, context, language });

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const raw = await geminiService.generateContent(
        attempt === 1 ? prompt : `${prompt}\n\nIMPORTANT: Your previous response failed JSON schema validation. Return ONLY strictly valid JSON, no markdown fences, no commentary.`
      );
      const validation = validateItinerary(raw);
      if (validation.success) {
        return { itinerary: validation.data, source: 'gemini' };
      }
      logger.warn(`Gemini re-plan failed validation on attempt ${attempt}: ${validation.error}`);
    } catch (err) {
      logger.error(`Gemini re-plan call failed on attempt ${attempt}: ${err.message}`);
    }
  }

  throw new Error('AI_REPLAN_FAILED');
}

module.exports = { plan, replan, buildDeterministicItinerary };

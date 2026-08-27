/**
 * aiController.js
 * -----------------------------------------------------------------
 * HTTP layer for the two AI endpoints:
 *   POST /api/ai/plan    — RAG + Gemini itinerary generation, persisted as a Trip
 *   POST /api/ai/replan  — modify an existing Trip's itinerary
 * -----------------------------------------------------------------
 */
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const ragService = require('../rag/rag.service');
const tripService = require('../services/tripService');
const geminiService = require('../ai/gemini.service');
const logger = require('../config/logger');
const { toPlain } = require('../utils/serializers');
const prisma = require('../config/prisma');
const env = require('../config/env');

// Free-tier cap on AI-generated itineraries — the one concrete thing
// that actually differs between Free and Premium (matches the
// "Unlimited AI itinerary planning" perk advertised on the Premium
// page/landing section). ADMIN accounts and Premium members are exempt.
// Counts existing Trips rather than a separate usage table, since every
// AI-planned trip is already persisted as one — no new schema needed.
const FREE_TRIP_LIMIT = 3;

const plan = asyncHandler(async (req, res) => {
  const body = req.body;

  if (!req.user.isPremium && req.user.role !== 'ADMIN') {
    const tripCount = await prisma.trip.count({ where: { userId: req.user.id } });
    if (tripCount >= FREE_TRIP_LIMIT) {
      throw new ApiError(
        403,
        `Free plan is limited to ${FREE_TRIP_LIMIT} AI itineraries. Upgrade to IntelliTrip Premium for unlimited AI planning.`
      );
    }
  }

  let days = 3;
  if (body.startDate && body.endDate) {
    const diff = Math.round((new Date(body.endDate) - new Date(body.startDate)) / 86400000) + 1;
    days = Math.max(1, diff);
  }

  const request = {
    destination: body.destination,
    startLocation: body.startLocation,
    startDate: body.startDate,
    endDate: body.endDate,
    days,
    travellers: body.travellers,
    tripType: body.tripType,
    budget: body.budget,
    interests: body.interests || [],
    travelStyle: body.travelStyle,
    foodPreference: body.foodPreference,
    accommodationPreference: body.accommodationPreference,
    activityPreference: body.activityPreference,
    naturalLanguageInput: body.naturalLanguageInput,
    language: body.language,
  };

  const { itinerary, source, destination } = await ragService.plan(request);

  const trip = await tripService.saveItineraryAsTrip({
    userId: req.user.id,
    itinerary,
    request,
    destinationId: destination?.id,
    source,
  });

  success(res, { trip: toPlain(trip), itinerary, source }, 201);
});

const replan = asyncHandler(async (req, res) => {
  const { tripId, instruction } = req.body;

  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId: req.user.id } });
  if (!trip) throw new ApiError(404, 'Trip not found.');
  if (!trip.rawAiResponse) throw new ApiError(400, 'This trip has no AI itinerary to modify yet.');

  const { itinerary, source } = await ragService.replan({
    existingItinerary: trip.rawAiResponse,
    instruction,
    language: req.user.language,
  });

  const updated = await tripService.applyReplanToTrip({ tripId, itinerary, source });
  success(res, { trip: toPlain(updated), itinerary, source });
});

// Site-wide AI chat widget — public (no login required), so visitors
// browsing the site can ask quick travel questions. Falls back to a
// friendly canned reply instead of erroring when Gemini isn't configured
// (no GEMINI_API_KEY set) or the call fails for any reason — the chat
// widget must never show a broken error to the user.
const CHAT_FALLBACK_REPLY =
  "I'm running without a live AI connection right now, but here's a quick tip: check the Explore page for hidden-gem destinations, or try the AI Planner (once logged in) to auto-build a day-by-day itinerary!";

const chat = asyncHandler(async (req, res) => {
  const { message, history } = req.body;
  try {
    const reply = await geminiService.chatReply(message, history);
    success(res, { reply, isFallback: false });
  } catch (err) {
    logger.warn(`[AI Chat] Gemini reply failed, using fallback: ${err.message}`);
    // TEMP DEBUG: show the real error right inside the chat bubble itself
    // (dev-only) so it can be diagnosed from a screenshot of the widget,
    // without needing terminal access. Remove this block once resolved.
    const debugReply =
      env.nodeEnv !== 'production'
        ? `${CHAT_FALLBACK_REPLY}\n\n[DEBUG — remove later] ${err.name || 'Error'}: ${err.message}`
        : CHAT_FALLBACK_REPLY;
    success(res, { reply: debugReply, isFallback: true });
  }
});

module.exports = { plan, replan, chat };

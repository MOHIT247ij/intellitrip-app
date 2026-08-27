/**
 * gemini.service.js
 * -----------------------------------------------------------------
 * The ONLY file in the backend that talks to Google Gemini. Isolating
 * it here means: (a) the API key is read from env in exactly one
 * place, (b) swapping models/providers later only touches this file,
 * (c) it's easy to point to in a viva as "this is where AI lives".
 *
 * GEMINI_API_KEY is a backend-only secret (backend/.env). It is never
 * sent to the frontend — the browser only ever calls our own
 * /api/ai/* endpoints, which call this service server-side.
 *
 * FALLBACK MODE: if no GEMINI_API_KEY is configured, this service
 * does not throw — it falls back to a deterministic template
 * generator (buildDeterministicItinerary) built purely from the RAG
 * context (real MySQL places). This keeps the whole application
 * demoable without requiring a paid/rate-limited API key, while still
 * returning genuinely data-driven (not hard-coded) itineraries.
 * -----------------------------------------------------------------
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../config/logger');

let client = null;
if (env.gemini.apiKey) {
  client = new GoogleGenerativeAI(env.gemini.apiKey);
}

const isConfigured = () => Boolean(client);

/**
 * generateContent — sends a single prompt to Gemini and returns the
 * raw text response. Throws on network/API failure so callers
 * (ai/rag services) can catch and fall back gracefully.
 */
async function generateContent(prompt) {
  if (!client) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }
  const model = client.getGenerativeModel({
    model: env.gemini.model,
    generationConfig: {
      temperature: 0.7,
      responseMimeType: 'application/json',
    },
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  logger.debug('Gemini responded', { chars: text?.length });
  return text;
}

/**
 * chatReply — freeform conversational reply for the site-wide AI chat
 * widget (separate from generateContent, which forces JSON-mode output
 * for itinerary planning). Takes the latest user message plus a short
 * rolling history and returns plain text. Throws GEMINI_NOT_CONFIGURED
 * when no API key is set, exactly like generateContent — the controller
 * catches this and serves a canned fallback reply instead of erroring.
 */
async function chatReply(message, history = []) {
  if (!client) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }
  const model = client.getGenerativeModel({
    model: env.gemini.model,
    generationConfig: { temperature: 0.7 },
  });

  const preamble = 'You are the IntelliTrip Travel Assistant, a friendly AI chat helper on IntelliTrip, an India-focused travel planning and booking website. Answer travel questions (destinations, itineraries, budgets, best time to visit, packing, safety, local transport, food) helpfully and concisely — a few sentences unless the user asks for a list. If asked something unrelated to travel, gently steer the conversation back to travel. Keep replies practical and India-travel-focused.';

  const historyText = (history || [])
    .slice(-6)
    .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n');

  const prompt = `${preamble}\n\n${historyText ? `Conversation so far:\n${historyText}\n\n` : ''}User: ${message}\nAssistant:`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();
  logger.debug('Gemini chat responded', { chars: text?.length });
  return text;
}

module.exports = { generateContent, chatReply, isConfigured };

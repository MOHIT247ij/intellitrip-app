/**
 * geocode.service.js
 * -----------------------------------------------------------------
 * Free, no-API-key geocoding using OpenStreetMap's Nominatim service —
 * the same open-data project that already powers the Leaflet map tiles
 * in the frontend (MapView.jsx). Used only as a fallback: when the AI
 * itinerary references a destination that isn't in our seeded MySQL
 * places table, we still want real point(s) on the map instead of a
 * blank "somewhere in India" view.
 *
 * Nominatim's usage policy (max ~1 request/second, descriptive
 * User-Agent) is respected here, and results are cached in memory for
 * the life of the server process so the same destination is never
 * looked up twice.
 * -----------------------------------------------------------------
 */
const axios = require('axios');
const logger = require('../config/logger');

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const cache = new Map();
let lastRequestAt = 0;

async function respectRateLimit() {
  const elapsed = Date.now() - lastRequestAt;
  const minGap = 1100; // Nominatim asks for max 1 request/second
  if (elapsed < minGap) {
    await new Promise((resolve) => setTimeout(resolve, minGap - elapsed));
  }
  lastRequestAt = Date.now();
}

/** Looks up a rough center point (lat/lng) for a place name. Returns null on any failure. */
async function geocodePlace(query) {
  if (!query) return null;
  const key = query.trim().toLowerCase();
  if (cache.has(key)) return cache.get(key);

  try {
    await respectRateLimit();
    const { data } = await axios.get(NOMINATIM_URL, {
      params: { q: query, format: 'json', limit: 1 },
      headers: { 'User-Agent': 'IntelliTrip-College-Project/1.0 (educational use)' },
      timeout: 6000,
    });
    const hit = Array.isArray(data) ? data[0] : null;
    const result = hit ? { latitude: Number(hit.lat), longitude: Number(hit.lon) } : null;
    cache.set(key, result);
    return result;
  } catch (err) {
    logger.warn(`Geocode lookup failed for "${query}": ${err.message}`);
    cache.set(key, null);
    return null;
  }
}

module.exports = { geocodePlace };

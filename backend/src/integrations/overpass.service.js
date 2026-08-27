/**
 * overpass.service.js
 * -----------------------------------------------------------------
 * Free, no-API-key point-of-interest lookup using OpenStreetMap's
 * Overpass API — the same open-data project already used for
 * geocoding (geocode.service.js) and the Leaflet map tiles.
 *
 * Used as the RAG fallback's second tier: when a traveller asks for a
 * destination that isn't in our own seeded MySQL places table, we look
 * up REAL nearby tourist attractions (museums, forts, beaches,
 * markets, temples, viewpoints...) around that city's geocoded center,
 * instead of only offering generic template activities. This is what
 * makes "any Indian city, not just our few seeded ones" actually work.
 * -----------------------------------------------------------------
 */
const axios = require('axios');
const logger = require('../config/logger');

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const TAG_RULES = [
  { match: (t) => t.natural === 'beach', category: 'Beach', duration: 150, cost: 0 },
  { match: (t) => Boolean(t.historic), category: 'History', duration: 90, cost: 150 },
  { match: (t) => t.tourism === 'viewpoint', category: 'Photography', duration: 60, cost: 0 },
  { match: (t) => t.tourism === 'museum' || t.tourism === 'gallery', category: 'History', duration: 100, cost: 200 },
  { match: (t) => t.tourism === 'zoo' || t.tourism === 'theme_park', category: 'Family', duration: 150, cost: 400 },
  { match: (t) => t.leisure === 'park' || t.leisure === 'garden', category: 'Nature', duration: 90, cost: 0 },
  { match: (t) => t.amenity === 'marketplace', category: 'Shopping', duration: 90, cost: 300 },
  { match: (t) => t.amenity === 'place_of_worship', category: 'Spiritual', duration: 60, cost: 0 },
  { match: (t) => t.tourism === 'attraction', category: 'Photography', duration: 90, cost: 150 },
];

function categorize(tags = {}) {
  return TAG_RULES.find((r) => r.match(tags)) || { category: 'Photography', duration: 90, cost: 150 };
}

const DESCRIPTION_TEMPLATES = {
  Beach: (label) => `A scenic beach spot near ${label}, popular for a relaxed walk by the water.`,
  History: (label) => `A historic site near ${label}, worth a visit for its heritage and architecture.`,
  Photography: (label) => `A well-known landmark or viewpoint near ${label}, great for photos.`,
  Family: (label) => `A fun outing spot near ${label}, good for families and groups.`,
  Nature: (label) => `A green, open space near ${label} to relax and unwind.`,
  Shopping: (label) => `A local market near ${label} for souvenirs and everyday shopping.`,
  Spiritual: (label) => `A place of worship near ${label}, known for its peaceful atmosphere.`,
};

function describe(category, label) {
  return (DESCRIPTION_TEMPLATES[category] || (() => `A popular local spot in ${label}.`))(label);
}

/**
 * findNearbyAttractions — real named tourist POIs around a lat/lng,
 * built purely from OpenStreetMap tags (no key, free, worldwide).
 * Returns [] on any failure or if nothing named turns up — callers
 * should always have a further (generic template) fallback.
 */
async function findNearbyAttractions({ latitude, longitude, label, limit = 30, radiusMeters = 20000 }) {
  if (latitude == null || longitude == null) return [];

  const query = `
    [out:json][timeout:15];
    (
      node["tourism"~"attraction|museum|viewpoint|gallery|zoo|theme_park"](around:${radiusMeters},${latitude},${longitude});
      node["historic"](around:${radiusMeters},${latitude},${longitude});
      node["natural"="beach"](around:${radiusMeters},${latitude},${longitude});
      node["leisure"~"park|garden"](around:${radiusMeters},${latitude},${longitude});
      node["amenity"~"marketplace|place_of_worship"](around:${radiusMeters},${latitude},${longitude});
    );
    out body ${limit * 2};
  `;

  try {
    const { data } = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'IntelliTrip-College-Project/1.0 (educational use)',
      },
      timeout: 16000,
    });

    const seen = new Set();
    const results = [];
    for (const el of data.elements || []) {
      const name = el.tags?.name;
      if (!name || seen.has(name.toLowerCase())) continue;
      if (el.lat == null || el.lon == null) continue;
      seen.add(name.toLowerCase());
      const { category, duration, cost } = categorize(el.tags);
      results.push({
        name,
        description: describe(category, label),
        latitude: el.lat,
        longitude: el.lon,
        category,
        durationMinutes: duration,
        estimatedCost: cost,
      });
      if (results.length >= limit) break;
    }
    return results;
  } catch (err) {
    logger.warn(`Overpass POI lookup failed for "${label}": ${err.message}`);
    return [];
  }
}

const CUISINE_LABELS = {
  indian: 'Indian', chinese: 'Chinese', italian: 'Italian', south_indian: 'South Indian',
  north_indian: 'North Indian', seafood: 'Seafood', pizza: 'Pizza', vegetarian: 'Vegetarian',
  regional: 'Regional', local: 'Local', mughlai: 'Mughlai', continental: 'Continental',
};

function restaurantDescription(tags, label) {
  const cuisineTag = tags.cuisine ? String(tags.cuisine).split(';')[0] : null;
  const cuisine = cuisineTag ? (CUISINE_LABELS[cuisineTag] || cuisineTag.replace(/_/g, ' ')) : null;
  const kind = tags.amenity === 'cafe' ? 'cafe' : tags.amenity === 'fast_food' ? 'quick-bite spot' : 'restaurant';
  return cuisine
    ? `A ${cuisine} ${kind} near ${label}.`
    : `A locally known ${kind} near ${label}.`;
}

// Rough, category-based average-cost-for-two estimate (no live pricing API
// exists free for restaurants) — cafes/fast food are cheaper than sit-down
// restaurants. Clearly marked as an estimate wherever it's shown.
function restaurantCostEstimate(tags) {
  if (tags.amenity === 'fast_food') return 300;
  if (tags.amenity === 'cafe') return 400;
  return 700;
}

/**
 * findNearbyRestaurants — real named restaurants/cafes/quick-bite spots
 * around a lat/lng, from OpenStreetMap (same free Overpass API, no key).
 * Kept separate from findNearbyAttractions so the Experiences page (things
 * to DO) and a future Restaurants page (places to EAT) can each query only
 * what they need.
 */
async function findNearbyRestaurants({ latitude, longitude, label, limit = 20, radiusMeters = 15000 }) {
  if (latitude == null || longitude == null) return [];

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"~"restaurant|cafe|fast_food"](around:${radiusMeters},${latitude},${longitude});
    );
    out body ${limit * 2};
  `;

  try {
    const { data } = await axios.post(OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'IntelliTrip-College-Project/1.0 (educational use)',
      },
      timeout: 16000,
    });

    const seen = new Set();
    const results = [];
    for (const el of data.elements || []) {
      const name = el.tags?.name;
      if (!name || seen.has(name.toLowerCase())) continue;
      if (el.lat == null || el.lon == null) continue;
      seen.add(name.toLowerCase());
      const cuisineTag = el.tags.cuisine ? String(el.tags.cuisine).split(';')[0] : null;
      results.push({
        name,
        description: restaurantDescription(el.tags, label),
        latitude: el.lat,
        longitude: el.lon,
        cuisine: cuisineTag ? (CUISINE_LABELS[cuisineTag] || cuisineTag.replace(/_/g, ' ')) : null,
        kind: el.tags.amenity === 'cafe' ? 'Cafe' : el.tags.amenity === 'fast_food' ? 'Quick Bite' : 'Restaurant',
        estimatedCostForTwo: restaurantCostEstimate(el.tags),
      });
      if (results.length >= limit) break;
    }
    return results;
  } catch (err) {
    logger.warn(`Overpass restaurant lookup failed for "${label}": ${err.message}`);
    return [];
  }
}

module.exports = { findNearbyAttractions, findNearbyRestaurants };

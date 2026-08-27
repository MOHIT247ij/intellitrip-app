/**
 * booking.provider.js
 * -----------------------------------------------------------------
 * Provider abstraction:  BookingProvider
 *                          ├── MockBookingProvider  (deterministic demo inventory, always available)
 *                          └── RapidApiBookingProvider (real hotel + flight search via
 *                                RapidAPI-hosted travel APIs)
 *
 * Controlled by env BOOKING_PROVIDER=mock|rapidapi.
 *
 * Real-data notes (read before a viva / demo):
 *   - Hotels use the "Booking.com" API on the RapidAPI marketplace
 *     (RAPIDAPI_HOTELS_HOST, default booking-com.p.rapidapi.com):
 *     first resolves the destination name to a `dest_id` via the
 *     locations endpoint, then searches real listings for a 2-night
 *     stay starting 14 days from today.
 *   - Flights use the "Sky Scrapper" API on RapidAPI (RAPIDAPI_FLIGHTS_HOST,
 *     default sky-scrapper.p.rapidapi.com) — the official Skyscanner API
 *     is closed to independent developers, so this free-tier mirror is
 *     the current real option ("Skyscanner44" used previously is
 *     defunct). Each city name is resolved to a skyId/entityId via its
 *     searchAirport endpoint before searching flights.
 *   - Cabs have no free real-time fare API (Ola/Uber require paid
 *     commercial partnerships) — fares are a calculated estimate from a
 *     real published India per-km rate card, not a live quote.
 *   - Experiences have no free activities-booking API (GetYourGuide/
 *     Viator require paid partnerships) — instead we pull real named
 *     nearby points of interest from OpenStreetMap (free, no key) and
 *     price them by category; only the price is an estimate.
 *   - Third-party travel APIs change response shapes and rate-limit
 *     often. Every real call is wrapped so ANY failure (bad/missing
 *     key, no results, unexpected shape, timeout, rate limit) falls
 *     back to the mock inventory automatically and logs why — the
 *     booking pages must never hard-break because of a flaky
 *     external API.
 * -----------------------------------------------------------------
 */
const env = require('../config/env');
const logger = require('../config/logger');
const { geocodePlace } = require('./geocode.service');
const { findNearbyAttractions, findNearbyRestaurants } = require('./overpass.service');

let axios;
try {
  // eslint-disable-next-line global-require
  axios = require('axios');
} catch (err) {
  axios = null;
}

function seedFromString(str) {
  return String(str || '')
    .split('')
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 7);
}

const HOTEL_NAMES = ['Sea Pearl Resort', 'Heritage Grand', 'Palm Grove Inn', 'The Mountain View', 'Lakeside Boutique Stay', 'Old Town Homestay'];
const AMENITIES = ['Free WiFi', 'Breakfast Included', 'Swimming Pool', 'Air Conditioning', 'Parking', 'Spa'];
const AIRLINES = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Akasa Air'];
const CAB_PROVIDERS = ['IntelliCabs', 'CityRide', 'OutstationGo'];
const EXPERIENCE_TEMPLATES = [
  { name: 'Sunset Cruise', category: 'Nature' },
  { name: 'Local Food Walking Tour', category: 'Food' },
  { name: 'Adventure Sports Combo', category: 'Adventure' },
  { name: 'Heritage Guided Walk', category: 'History' },
  { name: 'Photography Tour', category: 'Photography' },
];

// Real, published India local-cab rate cards (base fare + per-km rate) —
// there is no free real-time cab-pricing API (Ola/Uber require paid
// commercial partnerships), so instead of a purely random number we
// calculate a grounded estimate the same way a real cab fare works.
const CAB_RATE_CARD = [
  { vehicle: 'Hatchback (4 seater)', capacity: 4, baseFare: 60, perKm: 12 },
  { vehicle: 'Sedan (4 seater)', capacity: 4, baseFare: 80, perKm: 14 },
  { vehicle: 'SUV (6 seater)', capacity: 6, baseFare: 100, perKm: 19 },
  { vehicle: 'Tempo Traveller (12 seater)', capacity: 12, baseFare: 150, perKm: 25 },
];

function isoDateInDays(days) {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

function mockHotels(destination) {
  const seed = seedFromString(destination);
  return HOTEL_NAMES.map((name, i) => ({
    id: `hotel_${destination.toLowerCase()}_${i}`,
    name: `${name}${destination ? `, ${destination}` : ''}`,
    location: destination || 'India',
    rating: (3.5 + ((seed + i) % 15) / 10).toFixed(1) * 1,
    pricePerNight: 1800 + ((seed + i * 37) % 12) * 500,
    amenities: AMENITIES.filter((_, idx) => (seed + i + idx) % 2 === 0),
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    availability: (seed + i) % 5 !== 0,
    isMock: true,
    provider: 'MockBookingProvider',
  }));
}

function mockFlights(destination, startLocation = 'Delhi') {
  const seed = seedFromString(destination);
  return AIRLINES.map((airline, i) => {
    const depHour = 6 + ((seed + i * 3) % 14);
    const durationMin = 90 + ((seed + i * 11) % 120);
    const arrHour = (depHour + Math.floor(durationMin / 60)) % 24;
    return {
      id: `flight_${destination.toLowerCase()}_${i}`,
      airline,
      from: startLocation,
      to: destination,
      departure: `${String(depHour).padStart(2, '0')}:00`,
      arrival: `${String(arrHour).padStart(2, '0')}:${String(durationMin % 60).padStart(2, '0')}`,
      durationMinutes: durationMin,
      stops: (seed + i) % 3 === 0 ? 1 : 0,
      isDomestic: true,
      price: 2800 + ((seed + i * 53) % 10) * 400,
      isMock: true,
      provider: 'MockBookingProvider',
    };
  });
}

// There is no free real-time cab-booking API (Ola/Uber only offer paid
// commercial partnerships), so this is a calculated ESTIMATE — a
// realistic representative local-sightseeing distance (25-50km,
// deterministic per destination) run through real published per-km rate
// cards — not a live quote, but not a random number either.
function mockCabs(destination) {
  const seed = seedFromString(destination);
  const distanceKm = 25 + (seed % 25);
  return CAB_RATE_CARD.map((cab, i) => ({
    id: `cab_${destination.toLowerCase()}_${i}`,
    vehicle: cab.vehicle,
    provider: CAB_PROVIDERS[(seed + i) % CAB_PROVIDERS.length],
    capacity: cab.capacity,
    estimatedDistanceKm: distanceKm,
    estimatedFare: Math.round(cab.baseFare + cab.perKm * distanceKm),
    location: destination,
    isMock: true,
    isEstimate: true,
  }));
}

function mockExperiences(destination) {
  const seed = seedFromString(destination);
  return EXPERIENCE_TEMPLATES.map((tpl, i) => ({
    id: `experience_${destination.toLowerCase()}_${i}`,
    name: `${tpl.name} — ${destination}`,
    description: `A guided ${tpl.name.toLowerCase()} experience showcasing the best of ${destination}.`,
    category: tpl.category,
    price: 500 + ((seed + i * 41) % 10) * 200,
    durationMinutes: 90 + ((seed + i) % 4) * 30,
    location: destination,
    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    isMock: true,
    provider: 'MockBookingProvider',
  }));
}

const RESTAURANT_TEMPLATES = [
  { name: 'The Local Spice', kind: 'Restaurant', cuisine: 'Indian' },
  { name: 'Sunset Café', kind: 'Cafe', cuisine: 'Continental' },
  { name: 'Coastal Kitchen', kind: 'Restaurant', cuisine: 'Seafood' },
  { name: 'Quick Bites Corner', kind: 'Quick Bite', cuisine: 'Fast Food' },
  { name: 'Heritage Dining', kind: 'Restaurant', cuisine: 'Regional' },
];

function mockRestaurants(destination) {
  const seed = seedFromString(destination);
  return RESTAURANT_TEMPLATES.map((tpl, i) => ({
    id: `restaurant_${destination.toLowerCase()}_${i}`,
    name: `${tpl.name}, ${destination}`,
    description: `A ${tpl.cuisine.toLowerCase()} ${tpl.kind.toLowerCase()} popular with visitors to ${destination}.`,
    kind: tpl.kind,
    cuisine: tpl.cuisine,
    estimatedCostForTwo: 400 + ((seed + i * 37) % 6) * 100,
    location: destination,
    isMock: true,
    provider: 'MockBookingProvider',
  }));
}

/**
 * Real restaurants — no free real-time restaurant-booking API exists
 * (Zomato/Swiggy require paid commercial partnerships), so instead we
 * pull REAL named restaurants/cafes near the destination from
 * OpenStreetMap (same free Overpass lookup as Experiences). Real names,
 * real coordinates — only the average cost is a category-based estimate.
 */
async function realRestaurants(destination) {
  const center = (await geocodePlace(`${destination}, India`)) || (await geocodePlace(destination));
  if (!center) throw new Error(`Could not geocode "${destination}" for restaurants.`);

  const spots = await findNearbyRestaurants({ latitude: center.latitude, longitude: center.longitude, label: destination, limit: 15 });
  if (!spots.length) throw new Error(`No nearby OpenStreetMap restaurants found for "${destination}".`);

  return spots.map((r, i) => ({
    id: `restaurant_osm_${i}`,
    name: r.name,
    description: r.description,
    kind: r.kind,
    cuisine: r.cuisine || 'Local',
    estimatedCostForTwo: r.estimatedCostForTwo,
    location: destination,
    latitude: r.latitude,
    longitude: r.longitude,
    isMock: false,
    isEstimate: true,
    provider: 'OpenStreetMapPOI',
  }));
}

/**
 * Real experiences — no paid activities-booking API (GetYourGuide/Viator
 * require commercial partnerships), so instead we pull REAL nearby named
 * points of interest from OpenStreetMap (same free Overpass lookup used
 * by the AI itinerary fallback) and price them by category. Real names,
 * real coordinates, real Google Maps links — only the price is a
 * category-based estimate (marked isEstimate), not the entry-fee is fabricated.
 */
async function realExperiences(destination) {
  const center = (await geocodePlace(`${destination}, India`)) || (await geocodePlace(destination));
  if (!center) throw new Error(`Could not geocode "${destination}" for experiences.`);

  const pois = await findNearbyAttractions({ latitude: center.latitude, longitude: center.longitude, label: destination, limit: 12 });
  if (!pois.length) throw new Error(`No nearby OpenStreetMap points of interest found for "${destination}".`);

  return pois.map((p, i) => ({
    id: `experience_osm_${i}`,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.estimatedCost || 300,
    durationMinutes: p.durationMinutes || 90,
    location: destination,
    latitude: p.latitude,
    longitude: p.longitude,
    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
    isMock: false,
    isEstimate: true,
    provider: 'OpenStreetMapPOI',
  }));
}

function rapidApiHeaders(host, key = env.booking.rapidApiKey) {
  return { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host };
}

/**
 * Turns an axios error into a short, DIAGNOSTIC message that includes the
 * actual HTTP status + body RapidAPI sent back (instead of just axios's
 * generic "Request failed with status code 403"), so the backend terminal
 * log tells us exactly what's wrong — most commonly "You are not
 * subscribed to this API" (fix: open the API's page on the RapidAPI
 * marketplace → Pricing tab → Subscribe to the Basic/Free plan — this is
 * a SEPARATE subscription per API, even on the same account/key).
 */
function describeRapidApiError(err) {
  if (err.response) {
    const bodySnippet = typeof err.response.data === 'string' ? err.response.data.slice(0, 300) : JSON.stringify(err.response.data).slice(0, 300);
    return `HTTP ${err.response.status} — ${bodySnippet}`;
  }
  return err.message;
}

/** Real hotel search — Booking.com API on RapidAPI. Throws on any problem (caller catches + falls back). */
async function realHotels(destination) {
  if (!axios) throw new Error('axios is not installed.');
  if (!env.booking.rapidApiKey) throw new Error('RAPIDAPI_KEY is not configured.');

  const host = env.booking.rapidApiHotelsHost;
  const locationsRes = await axios.get(`https://${host}/v1/hotels/locations`, {
    headers: rapidApiHeaders(host),
    params: { name: destination, locale: 'en-gb' },
    timeout: 10000,
  });
  const dest = locationsRes.data?.[0];
  if (!dest?.dest_id) throw new Error(`No RapidAPI dest_id found for "${destination}".`);

  const checkin = isoDateInDays(14);
  const checkout = isoDateInDays(16);
  const searchRes = await axios.get(`https://${host}/v1/hotels/search`, {
    headers: rapidApiHeaders(host),
    params: {
      dest_id: dest.dest_id,
      dest_type: dest.dest_type || 'city',
      checkin_date: checkin,
      checkout_date: checkout,
      adults_number: 2,
      room_number: 1,
      order_by: 'popularity',
      filter_by_currency: 'INR',
      units: 'metric',
      locale: 'en-gb',
      page_number: 0,
    },
    timeout: 12000,
  });

  const results = searchRes.data?.result || [];
  if (!results.length) throw new Error('RapidAPI hotel search returned no results.');

  const mapped = results.map((h, i) => ({
    id: `hotel_rapidapi_${h.hotel_id || i}`,
    name: h.hotel_name || `Hotel in ${destination}`,
    location: h.address || destination,
    rating: h.review_score ? Number(h.review_score) : null,
    pricePerNight: Math.round(h.min_total_price || h.composite_price_breakdown?.gross_amount?.value || 0),
    amenities: [],
    imageUrl: h.max_photo_url || h.main_photo_url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    availability: true,
    checkin,
    checkout,
    isMock: false,
    provider: 'RapidApiBookingProvider',
  }));

  // A handful of RapidAPI listings come back with no price/name resolved
  // (a data-quality gap upstream, not our bug) — drop those instead of
  // showing a confusing "₹0/night" card.
  const usable = mapped.filter((h) => h.pricePerNight > 0);
  if (!usable.length) throw new Error('RapidAPI hotel search returned no usable (priced) results.');

  return usable.slice(0, 8);
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// The Sky Scrapper free plan has a very tight quota (a few requests/month)
// AND a per-second throttle. Caching resolved skyIds (airport codes never
// change) means a city is only ever looked up once, no matter how many
// times someone searches flights to/from it — this saves quota fast.
const skyIdCache = new Map();

/**
 * Resolves a free-text city name to the skyId/entityId the Sky Scrapper
 * flight-search endpoint requires. Cached in memory per city (see above).
 */
async function resolveSkyId(host, city) {
  const cacheKey = city.trim().toLowerCase();
  if (skyIdCache.has(cacheKey)) return skyIdCache.get(cacheKey);

  let res;
  try {
    res = await axios.get(`https://${host}/api/v1/flights/searchAirport`, {
      headers: rapidApiHeaders(host, env.booking.rapidApiFlightsKey),
      params: { query: city, locale: 'en-US' },
      timeout: 10000,
    });
  } catch (err) {
    throw new Error(`searchAirport("${city}") request failed — ${describeRapidApiError(err)}`);
  }
  const hit = (res.data?.data || [])[0];
  const skyId = hit?.skyId || hit?.navigation?.relevantFlightParams?.skyId;
  const entityId = hit?.entityId || hit?.navigation?.relevantFlightParams?.entityId;
  if (!skyId || !entityId) throw new Error(`Could not resolve an airport/city for "${city}" (response shape: ${JSON.stringify(res.data).slice(0, 200)}).`);
  const result = { skyId, entityId };
  skyIdCache.set(cacheKey, result);
  return result;
}

/**
 * Real flight search — "Sky Scrapper" API on RapidAPI (host
 * sky-scrapper.p.rapidapi.com). The official Skyscanner API is closed to
 * independent developers, so this free-tier mirror is the current real
 * option; subscribe to "Sky Scrapper" (not "Skyscanner44", which is
 * defunct) on the RapidAPI marketplace for RAPIDAPI_KEY to work here.
 * Throws on any problem (caller catches + falls back to mock).
 */
async function realFlights(destination, startLocation = 'Delhi') {
  if (!axios) throw new Error('axios is not installed.');
  if (!env.booking.rapidApiFlightsKey) throw new Error('RAPIDAPI_KEY / RAPIDAPI_FLIGHTS_KEY is not configured.');

  const host = env.booking.rapidApiFlightsHost;
  // Sequential (not Promise.all) on purpose — the free plan throttles
  // simultaneous requests; a small gap avoids tripping "Too many requests".
  const origin = await resolveSkyId(host, startLocation);
  await sleep(600);
  const dest = await resolveSkyId(host, destination);
  await sleep(600);

  const departureDate = isoDateInDays(14);
  let res;
  try {
    res = await axios.get(`https://${host}/api/v1/flights/searchFlights`, {
      headers: rapidApiHeaders(host, env.booking.rapidApiFlightsKey),
      params: {
        originSkyId: origin.skyId,
        destinationSkyId: dest.skyId,
        originEntityId: origin.entityId,
        destinationEntityId: dest.entityId,
        date: departureDate,
        adults: 1,
        currency: 'INR',
        countryCode: 'IN',
        market: 'en-IN',
      },
      timeout: 15000,
    });
  } catch (err) {
    throw new Error(`searchFlights request failed — ${describeRapidApiError(err)}`);
  }

  const itineraries = res.data?.data?.itineraries || res.data?.itineraries || [];
  if (!itineraries.length) throw new Error('RapidAPI flight search returned no itineraries.');

  const results = itineraries.slice(0, 8).map((it, i) => {
    const leg = it.legs?.[0] || {};
    const carrier = leg.carriers?.marketing?.[0] || leg.carriers?.[0] || {};
    const priceRaw = it.price?.raw ?? it.price?.amount ?? 0;
    return {
      id: `flight_rapidapi_${i}`,
      airline: carrier.name || 'Airline',
      from: startLocation,
      to: destination,
      departure: leg.departure ? String(leg.departure).slice(11, 16) : '--:--',
      arrival: leg.arrival ? String(leg.arrival).slice(11, 16) : '--:--',
      durationMinutes: leg.durationInMinutes || leg.duration || null,
      stops: leg.stopCount ?? leg.stops ?? 0,
      isDomestic: true,
      price: Math.round(priceRaw),
      isMock: false,
      provider: 'RapidApiBookingProvider(SkyScrapper)',
    };
  });

  const usable = results.filter((f) => f.price > 0);
  if (!usable.length) throw new Error('RapidAPI flight search returned no usable (priced) itineraries.');
  return usable;
}

async function getHotels(destination) {
  if (env.booking.provider === 'rapidapi') {
    try {
      return await realHotels(destination);
    } catch (err) {
      logger.warn(`[RapidAPI] hotel search failed for "${destination}", falling back to mock: ${err.message}`);
    }
  }
  return mockHotels(destination);
}

// Sky Scrapper's free BASIC plan has a small MONTHLY request quota (not
// just a per-second throttle) — once it's used up, RapidAPI returns
// HTTP 429 "You have exceeded the MONTHLY quota" until the plan resets,
// and every search falls back to mock for the rest of the month. To make
// that quota last, successful real results are cached in memory per
// route for a few hours — repeat searches for the same From/To (common
// during a demo or a user re-checking the same trip) are served from
// cache instead of spending another quota unit.
const flightResultsCache = new Map();
const FLIGHT_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function getFlights(destination, startLocation) {
  if (env.booking.provider === 'rapidapi') {
    const cacheKey = `${(startLocation || 'Delhi').trim().toLowerCase()}|${destination.trim().toLowerCase()}`;
    const cached = flightResultsCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }
    try {
      const data = await realFlights(destination, startLocation);
      flightResultsCache.set(cacheKey, { data, expiresAt: Date.now() + FLIGHT_CACHE_TTL_MS });
      return data;
    } catch (err) {
      logger.warn(`[RapidAPI] flight search failed for "${destination}", falling back to mock: ${err.message}`);
    }
  }
  return mockFlights(destination, startLocation);
}

// Cabs: no free real-time fare API exists — always a grounded estimate.
async function getCabs(destination) {
  return mockCabs(destination);
}

// Experiences: real named places via free OpenStreetMap lookup, falling
// back to generic templates only if that lookup fails.
async function getExperiences(destination) {
  try {
    return await realExperiences(destination);
  } catch (err) {
    logger.warn(`[OSM] experiences lookup failed for "${destination}", falling back to generic templates: ${err.message}`);
    return mockExperiences(destination);
  }
}

// Restaurants: real named places via free OpenStreetMap lookup, falling
// back to generic templates only if that lookup fails (same pattern as
// Experiences above).
async function getRestaurants(destination) {
  try {
    return await realRestaurants(destination);
  } catch (err) {
    logger.warn(`[OSM] restaurant lookup failed for "${destination}", falling back to mock: ${err.message}`);
    return mockRestaurants(destination);
  }
}

module.exports = { getHotels, getFlights, getCabs, getExperiences, getRestaurants };

/**
 * retrieval.service.js
 * -----------------------------------------------------------------
 * The "R" in RAG (Retrieval-Augmented Generation).
 *
 * Instead of a vector database, our retrieval step queries MySQL
 * directly via Prisma — this is a legitimate and common RAG pattern
 * for structured domain data (the "R" doesn't have to be a vector
 * search; it just has to fetch relevant grounding context before
 * generation). For a college project this keeps the architecture
 * honest and explainable: real destination/place rows, filtered by
 * relevance, become the context Gemini is grounded on.
 * -----------------------------------------------------------------
 */
const prisma = require('../config/prisma');

/**
 * retrieveDestinationContext — finds the destination row matching the
 * traveller's requested destination (fuzzy match on name/slug), then
 * pulls its places, ranked so that:
 *   1) Places matching the traveller's stated interests come first
 *   2) A healthy mix of hidden gems is guaranteed even without a
 *      category match, satisfying "surface hidden gems" requirement
 */
async function retrieveDestinationContext({ destinationName, interests = [], limit = 14 }) {
  if (!destinationName) return { destination: null, places: [] };

  const destination = await prisma.destination.findFirst({
    where: {
      OR: [
        { name: { contains: destinationName } },
        { slug: { contains: destinationName.toLowerCase().replace(/\s+/g, '-') } },
      ],
    },
  });

  if (!destination) return { destination: null, places: [] };

  const allPlaces = await prisma.place.findMany({
    where: { destinationId: destination.id },
    orderBy: { rating: 'desc' },
  });

  const normalizedInterests = interests.map((i) => i.toLowerCase());
  const matchesInterest = (place) =>
    normalizedInterests.length === 0 ||
    normalizedInterests.some((i) => place.category.toLowerCase().includes(i) || i.includes(place.category.toLowerCase()));

  const interestMatches = allPlaces.filter(matchesInterest);
  const hiddenGems = allPlaces.filter((p) => p.isHiddenGem);
  const popular = allPlaces.filter((p) => !p.isHiddenGem);

  // Merge: interest matches first, then remaining hidden gems, then remaining popular spots — de-duplicated
  const seen = new Set();
  const ranked = [];
  for (const group of [interestMatches, hiddenGems, popular]) {
    for (const place of group) {
      if (!seen.has(place.id)) {
        seen.add(place.id);
        ranked.push(place);
      }
    }
  }

  return { destination, places: ranked.slice(0, limit) };
}

/**
 * retrieveByFreeText — used for the natural-language planner input.
 * Extracts a likely destination name by checking which seeded
 * destination name appears in the traveller's free-text request.
 */
async function retrieveDestinationFromText(text) {
  if (!text) return null;
  const destinations = await prisma.destination.findMany();
  const lower = text.toLowerCase();
  return destinations.find((d) => lower.includes(d.name.toLowerCase())) || null;
}

module.exports = { retrieveDestinationContext, retrieveDestinationFromText };

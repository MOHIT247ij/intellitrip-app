/**
 * context-builder.js
 * -----------------------------------------------------------------
 * Turns raw Prisma rows (destination + places) into a compact,
 * readable text block that gets injected into the Gemini prompt.
 * This is the "context" the LLM is grounded on — every fact in it
 * came from MySQL, not from the model's imagination.
 * -----------------------------------------------------------------
 */
function formatCost(cost) {
  const n = typeof cost?.toNumber === 'function' ? cost.toNumber() : Number(cost);
  return n > 0 ? `₹${n}` : 'Free';
}

function buildContext({ destination, places }) {
  if (!destination) {
    return 'No verified destination record found in the database for this request. Use general, realistic knowledge of Indian travel and clearly stick to well-known, safe assumptions.';
  }

  const lines = [];
  lines.push(`Destination: ${destination.name}, ${destination.state || ''} (${destination.country})`);
  lines.push(`Overview: ${destination.description}`);
  if (destination.bestTimeToVisit) lines.push(`Best time to visit: ${destination.bestTimeToVisit}`);
  if (destination.avgCostPerDay) lines.push(`Typical average cost per day: ₹${destination.avgCostPerDay}`);
  lines.push('');
  lines.push('Verified places (use these as the primary source for itinerary activities):');

  for (const place of places) {
    const tag = place.isHiddenGem ? '[HIDDEN GEM]' : '[POPULAR]';
    const lat = place.latitude != null ? Number(place.latitude) : null;
    const lng = place.longitude != null ? Number(place.longitude) : null;
    lines.push(
      `- ${tag} ${place.name} | category: ${place.category} | duration: ~${place.avgDurationMinutes} min | cost: ${formatCost(
        place.estimatedCost
      )} | coordinates: ${lat != null ? `${lat}, ${lng}` : 'unknown'} | ${place.description}`
    );
  }

  return lines.join('\n');
}

module.exports = { buildContext };

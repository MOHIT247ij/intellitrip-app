const { validateItinerary } = require('../src/ai/ai.utils');

const VALID_ITINERARY = {
  tripTitle: 'Goa Adventure Escape',
  summary: 'A personalized 5-day Goa itinerary',
  destination: 'Goa',
  estimatedBudget: 25000,
  currency: 'INR',
  days: [
    {
      day: 1,
      title: 'North Goa Exploration',
      activities: [
        {
          name: 'Fort Aguada',
          description: 'Explore the historic fort and coastline.',
          location: 'Fort Aguada',
          latitude: 15.492,
          longitude: 73.773,
          category: 'History',
          durationMinutes: 120,
          estimatedCost: 100,
        },
      ],
    },
  ],
  tips: [],
};

describe('AI itinerary validation (ai.utils.validateItinerary)', () => {
  it('accepts a well-formed itinerary JSON string', () => {
    const result = validateItinerary(JSON.stringify(VALID_ITINERARY));
    expect(result.success).toBe(true);
    expect(result.data.tripTitle).toBe('Goa Adventure Escape');
  });

  it('accepts JSON wrapped in a markdown code fence (Gemini sometimes adds these)', () => {
    const fenced = '```json\n' + JSON.stringify(VALID_ITINERARY) + '\n```';
    const result = validateItinerary(fenced);
    expect(result.success).toBe(true);
  });

  it('rejects invalid JSON text', () => {
    const result = validateItinerary('this is not json at all');
    expect(result.success).toBe(false);
  });

  it('rejects JSON missing required fields', () => {
    const broken = { tripTitle: 'Incomplete' };
    const result = validateItinerary(JSON.stringify(broken));
    expect(result.success).toBe(false);
  });

  it('rejects an itinerary with zero days', () => {
    const broken = { ...VALID_ITINERARY, days: [] };
    const result = validateItinerary(JSON.stringify(broken));
    expect(result.success).toBe(false);
  });
});

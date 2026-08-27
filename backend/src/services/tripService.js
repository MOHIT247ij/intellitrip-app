/**
 * tripService.js
 * Business logic for turning a validated AI itinerary JSON object
 * into relational Trip / TripDay / ItineraryItem rows, plus plain
 * trip CRUD used by the /trips pages.
 */
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');

/** Persists an AI-generated (or fallback) itinerary as a full Trip graph. */
async function saveItineraryAsTrip({ userId, itinerary, request, destinationId, source }) {
  const startDate = request.startDate ? new Date(request.startDate) : new Date();
  const endDate = request.endDate
    ? new Date(request.endDate)
    : new Date(startDate.getTime() + (itinerary.days.length - 1) * 86400000);

  const trip = await prisma.trip.create({
    data: {
      userId,
      destinationId: destinationId || null,
      title: itinerary.tripTitle,
      startLocation: request.startLocation || null,
      startDate,
      endDate,
      travellers: request.travellers || 1,
      tripType: request.tripType || null,
      budget: request.budget || null,
      currency: itinerary.currency || 'INR',
      interests: request.interests || [],
      travelStyle: request.travelStyle || null,
      foodPreference: request.foodPreference || null,
      accommodationPreference: request.accommodationPreference || null,
      activityPreference: request.activityPreference || null,
      status: 'PLANNED',
      aiSummary: itinerary.summary,
      estimatedBudget: itinerary.estimatedBudget,
      rawAiResponse: { ...itinerary, meta: { source } },
      days: {
        create: itinerary.days.map((day) => ({
          dayNumber: day.day,
          title: day.title,
          items: {
            create: day.activities.map((activity, idx) => ({
              name: activity.name,
              description: activity.description,
              location: activity.location,
              latitude: activity.latitude ?? null,
              longitude: activity.longitude ?? null,
              category: activity.category,
              startTime: activity.startTime || null,
              durationMinutes: activity.durationMinutes,
              estimatedCost: activity.estimatedCost,
              orderIndex: idx,
            })),
          },
        })),
      },
    },
    include: { days: { include: { items: true }, orderBy: { dayNumber: 'asc' } } },
  });

  return trip;
}

/** Rebuilds Trip/TripDay/ItineraryItem rows to match a re-planned itinerary, replacing the old ones. */
async function applyReplanToTrip({ tripId, itinerary, source }) {
  await prisma.tripDay.deleteMany({ where: { tripId } }); // cascades to itineraryItems

  const trip = await prisma.trip.update({
    where: { id: tripId },
    data: {
      title: itinerary.tripTitle,
      aiSummary: itinerary.summary,
      estimatedBudget: itinerary.estimatedBudget,
      rawAiResponse: { ...itinerary, meta: { source } },
      days: {
        create: itinerary.days.map((day) => ({
          dayNumber: day.day,
          title: day.title,
          items: {
            create: day.activities.map((activity, idx) => ({
              name: activity.name,
              description: activity.description,
              location: activity.location,
              latitude: activity.latitude ?? null,
              longitude: activity.longitude ?? null,
              category: activity.category,
              startTime: activity.startTime || null,
              durationMinutes: activity.durationMinutes,
              estimatedCost: activity.estimatedCost,
              orderIndex: idx,
            })),
          },
        })),
      },
    },
    include: { days: { include: { items: true }, orderBy: { dayNumber: 'asc' } } },
  });

  return trip;
}

async function listTripsForUser(userId) {
  return prisma.trip.findMany({
    where: { userId },
    include: { destination: true, days: { select: { id: true, dayNumber: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getTripForUser(userId, tripId) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      destination: true,
      days: { include: { items: { orderBy: { orderIndex: 'asc' } } }, orderBy: { dayNumber: 'asc' } },
    },
  });
  if (!trip) throw new ApiError(404, 'Trip not found.');
  return trip;
}

async function deleteTripForUser(userId, tripId) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId } });
  if (!trip) throw new ApiError(404, 'Trip not found.');
  await prisma.trip.delete({ where: { id: tripId } });
}

module.exports = { saveItineraryAsTrip, applyReplanToTrip, listTripsForUser, getTripForUser, deleteTripForUser };

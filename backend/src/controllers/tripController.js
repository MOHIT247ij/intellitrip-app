const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const tripService = require('../services/tripService');
const { toPlain } = require('../utils/serializers');
const { streamTripPdf } = require('../integrations/pdf.service');

const createTrip = asyncHandler(async (req, res) => {
  const { title, destinationId, startLocation, startDate, endDate, travellers, tripType, budget, currency } = req.body;
  const trip = await prisma.trip.create({
    data: {
      userId: req.user.id,
      title,
      destinationId: destinationId || null,
      startLocation: startLocation || null,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      travellers: travellers || 1,
      tripType: tripType || null,
      budget: budget || null,
      currency: currency || 'INR',
      status: 'DRAFT',
    },
  });
  success(res, toPlain(trip), 201);
});

const listTrips = asyncHandler(async (req, res) => {
  const trips = await tripService.listTripsForUser(req.user.id);
  const now = new Date();
  const withStatus = trips.map((t) => ({
    ...t,
    computedStatus: t.status === 'CANCELLED' ? 'CANCELLED' : new Date(t.endDate) < now ? 'PAST' : 'UPCOMING',
  }));
  success(res, toPlain(withStatus));
});

const getTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripForUser(req.user.id, Number(req.params.id));
  success(res, toPlain(trip));
});

const updateTrip = asyncHandler(async (req, res) => {
  const existing = await prisma.trip.findFirst({ where: { id: Number(req.params.id), userId: req.user.id } });
  if (!existing) throw new ApiError(404, 'Trip not found.');

  const data = { ...req.body };
  if (data.startDate) data.startDate = new Date(data.startDate);
  if (data.endDate) data.endDate = new Date(data.endDate);

  const trip = await prisma.trip.update({ where: { id: existing.id }, data });
  success(res, toPlain(trip));
});

const deleteTrip = asyncHandler(async (req, res) => {
  await tripService.deleteTripForUser(req.user.id, Number(req.params.id));
  success(res, { deleted: true });
});

const exportTripPdf = asyncHandler(async (req, res) => {
  const trip = await tripService.getTripForUser(req.user.id, Number(req.params.id));
  await streamTripPdf(trip, res);
});

module.exports = { createTrip, listTrips, getTrip, updateTrip, deleteTrip, exportTripPdf };

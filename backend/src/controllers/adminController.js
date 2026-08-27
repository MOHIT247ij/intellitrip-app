/**
 * adminController.js
 * Minimal admin panel API, protected by role-based auth
 * (middleware/auth.js `authorize('ADMIN')`). Keeps the surface small
 * and understandable for a viva rather than a full back-office suite.
 */
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');
const { sanitizeUser } = require('../services/authService');

const getStats = asyncHandler(async (req, res) => {
  const [userCount, tripCount, bookingCount, placeCount] = await Promise.all([
    prisma.user.count(),
    prisma.trip.count(),
    prisma.booking.count(),
    prisma.place.count(),
  ]);
  success(res, { userCount, tripCount, bookingCount, placeCount });
});

const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  success(res, toPlain(users.map(sanitizeUser)));
});

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    include: { user: { select: { id: true, fullName: true, email: true } }, items: true, payment: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  success(res, toPlain(bookings));
});

const listPlaces = asyncHandler(async (req, res) => {
  const places = await prisma.place.findMany({ include: { destination: true }, orderBy: { id: 'asc' } });
  success(res, toPlain(places));
});

const listTrips = asyncHandler(async (req, res) => {
  const trips = await prisma.trip.findMany({
    include: { user: { select: { id: true, fullName: true, email: true } }, destination: true },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });
  success(res, toPlain(trips));
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const booking = await prisma.booking.update({ where: { id: Number(req.params.id) }, data: { status } });
  success(res, toPlain(booking));
});

module.exports = { getStats, listUsers, listBookings, listPlaces, listTrips, updateBookingStatus };

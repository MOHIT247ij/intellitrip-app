const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

async function createBooking({ userId, tripId, type, items }) {
  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * (item.quantity || 1), 0);

  const booking = await prisma.booking.create({
    data: {
      userId,
      tripId: tripId || null,
      type,
      totalAmount,
      isMock: env.booking.provider !== 'rapidapi',
      provider: env.booking.provider === 'rapidapi' ? 'RapidApiBookingProvider' : 'MockBookingProvider',
      items: {
        create: items.map((item) => ({
          itemName: item.itemName,
          description: item.description || null,
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice,
          metadata: item.metadata || undefined,
        })),
      },
    },
    include: { items: true },
  });

  return booking;
}

async function listBookingsForUser(userId) {
  return prisma.booking.findMany({
    where: { userId },
    include: { items: true, payment: true, trip: { select: { id: true, title: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

async function getBookingForUser(userId, bookingId) {
  const booking = await prisma.booking.findFirst({
    where: { id: bookingId, userId },
    include: { items: true, payment: true },
  });
  if (!booking) throw new ApiError(404, 'Booking not found.');
  return booking;
}

module.exports = { createBooking, listBookingsForUser, getBookingForUser };

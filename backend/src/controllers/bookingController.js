const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const { toPlain } = require('../utils/serializers');
const bookingService = require('../services/bookingService');

const createBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.createBooking({ userId: req.user.id, ...req.body });
  success(res, toPlain(booking), 201);
});

const listBookings = asyncHandler(async (req, res) => {
  const bookings = await bookingService.listBookingsForUser(req.user.id);
  success(res, toPlain(bookings));
});

const getBooking = asyncHandler(async (req, res) => {
  const booking = await bookingService.getBookingForUser(req.user.id, Number(req.params.id));
  success(res, toPlain(booking));
});

module.exports = { createBooking, listBookings, getBooking };

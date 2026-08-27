/**
 * inventoryController.js
 * Read-only "browse" endpoints backing the /hotels /flights /cabs
 * /experiences pages. Inventory comes from booking.provider.js
 * (MockBookingProvider by default — see BOOKING_PROVIDER in .env).
 */
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const bookingProvider = require('../integrations/booking.provider');

const requireDestination = (req) => {
  const destination = req.query.destination;
  if (!destination) throw new ApiError(400, 'A "destination" query parameter is required.');
  return destination;
};

const getHotels = asyncHandler(async (req, res) => {
  const destination = requireDestination(req);
  success(res, await bookingProvider.getHotels(destination));
});

const getFlights = asyncHandler(async (req, res) => {
  const destination = requireDestination(req);
  const startLocation = req.query.from || 'Delhi';
  success(res, await bookingProvider.getFlights(destination, startLocation));
});

const getCabs = asyncHandler(async (req, res) => {
  const destination = requireDestination(req);
  success(res, await bookingProvider.getCabs(destination));
});

const getExperiences = asyncHandler(async (req, res) => {
  const destination = requireDestination(req);
  success(res, await bookingProvider.getExperiences(destination));
});

const getRestaurants = asyncHandler(async (req, res) => {
  const destination = requireDestination(req);
  success(res, await bookingProvider.getRestaurants(destination));
});

module.exports = { getHotels, getFlights, getCabs, getExperiences, getRestaurants };

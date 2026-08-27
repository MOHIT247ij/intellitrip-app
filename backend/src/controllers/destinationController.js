const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');

const listDestinations = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const destinations = await prisma.destination.findMany({
    where: search
      ? {
          OR: [
            { name: { contains: search } },
            { state: { contains: search } },
            { description: { contains: search } },
          ],
        }
      : undefined,
    include: { _count: { select: { places: true } } },
    orderBy: { name: 'asc' },
  });
  success(res, toPlain(destinations));
});

const getDestination = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: { places: { orderBy: { rating: 'desc' } } },
  });
  if (!destination) throw new ApiError(404, 'Destination not found.');
  success(res, toPlain(destination));
});

module.exports = { listDestinations, getDestination };

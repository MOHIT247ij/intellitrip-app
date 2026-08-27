const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');

/**
 * GET /api/places
 * Supports the Explore page filters: search, destinationId, category,
 * hiddenGemsOnly, maxCost.
 */
const listPlaces = asyncHandler(async (req, res) => {
  const { search, destinationId, category, hiddenGemsOnly, maxCost } = req.query;

  const where = {};
  if (search) where.name = { contains: search };
  if (destinationId) where.destinationId = Number(destinationId);
  if (category) where.category = category;
  if (hiddenGemsOnly === 'true') where.isHiddenGem = true;
  if (maxCost) where.estimatedCost = { lte: Number(maxCost) };

  const places = await prisma.place.findMany({
    where,
    include: { destination: { select: { id: true, name: true, slug: true } } },
    orderBy: [{ rating: 'desc' }],
  });
  success(res, toPlain(places));
});

const getPlace = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const place = await prisma.place.findUnique({
    where: { id },
    include: {
      destination: true,
      reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  });
  if (!place) throw new ApiError(404, 'Place not found.');
  success(res, toPlain(place));
});

module.exports = { listPlaces, getPlace };

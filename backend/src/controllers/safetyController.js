/**
 * safetyController.js
 * GET /api/safety?city=...&state=...
 * Returns verified emergency numbers from MySQL (national numbers
 * plus any city-specific entries). We never fabricate a phone
 * number — everything returned comes from the emergency_contacts
 * table, seeded from officially published national helplines.
 */
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');

const getSafetyInfo = asyncHandler(async (req, res) => {
  const { city } = req.query;

  const contacts = await prisma.emergencyContact.findMany({
    where: city ? { OR: [{ isNational: true }, { city: { contains: city } }] } : { isNational: true },
    orderBy: [{ isNational: 'desc' }, { type: 'asc' }],
  });

  success(res, {
    contacts: toPlain(contacts),
    note: 'Emergency numbers are sourced from our verified database. For your exact real-time location, please also use your phone\'s built-in emergency SOS feature.',
  });
});

module.exports = { getSafetyInfo };

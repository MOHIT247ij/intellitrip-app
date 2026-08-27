const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');
const { sanitizeUser } = require('../services/authService');

const getMe = asyncHandler(async (req, res) => {
  const preference = await prisma.userPreference.findUnique({ where: { userId: req.user.id } });
  success(res, { user: toPlain(sanitizeUser(req.user)), preference: toPlain(preference) });
});

const updateProfile = asyncHandler(async (req, res) => {
  const {
    fullName,
    profileImage,
    language,
    budgetPreference,
    travelStyle,
    favouriteDestinations,
    activities,
    foodPreference,
    accommodationPreference,
    activityPreference,
  } = req.body;

  const userData = {};
  if (fullName !== undefined) userData.fullName = fullName;
  if (profileImage !== undefined) userData.profileImage = profileImage || null;
  if (language !== undefined) userData.language = language;
  if (budgetPreference !== undefined) userData.budgetPreference = budgetPreference;
  if (travelStyle !== undefined) userData.travelStyle = travelStyle;

  const user = Object.keys(userData).length
    ? await prisma.user.update({ where: { id: req.user.id }, data: userData })
    : req.user;

  const prefData = {};
  if (favouriteDestinations !== undefined) prefData.favouriteDestinations = favouriteDestinations;
  if (activities !== undefined) prefData.activities = activities;
  if (travelStyle !== undefined) prefData.travelStyle = travelStyle;
  if (foodPreference !== undefined) prefData.foodPreference = foodPreference;
  if (accommodationPreference !== undefined) prefData.accommodationPreference = accommodationPreference;
  if (activityPreference !== undefined) prefData.activityPreference = activityPreference;

  const preference = await prisma.userPreference.upsert({
    where: { userId: req.user.id },
    update: prefData,
    create: { userId: req.user.id, ...prefData },
  });

  success(res, { user: toPlain(sanitizeUser(user)), preference: toPlain(preference) });
});

module.exports = { getMe, updateProfile };

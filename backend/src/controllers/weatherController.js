const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const weatherService = require('../integrations/weather.service');

const getWeather = asyncHandler(async (req, res) => {
  const { city } = req.query;
  if (!city) throw new ApiError(400, 'A "city" query parameter is required.');
  const weather = await weatherService.getWeather(city);
  success(res, weather);
});

module.exports = { getWeather };

/**
 * weather.service.js
 * -----------------------------------------------------------------
 * Provider abstraction:  WeatherProvider
 *                          ├── OpenWeatherProvider (real API)
 *                          └── MockWeatherProvider (deterministic demo data)
 *
 * Controlled by env WEATHER_PROVIDER=openweather|mock. If OpenWeather
 * is selected but the call fails (bad key, network, rate limit), we
 * degrade gracefully to the mock provider AND flag the response so
 * the frontend can show:
 *   "Weather service is temporarily unavailable. You can continue
 *    planning without live weather."
 * -----------------------------------------------------------------
 */
const axios = require('axios');
const env = require('../config/env');
const logger = require('../config/logger');

const OPEN_WEATHER_URL = 'https://api.openweathermap.org/data/2.5';

async function openWeatherProvider(city) {
  const { data } = await axios.get(`${OPEN_WEATHER_URL}/weather`, {
    params: { q: `${city},IN`, appid: env.weather.apiKey, units: 'metric' },
    timeout: 6000,
  });
  const { data: forecastData } = await axios.get(`${OPEN_WEATHER_URL}/forecast`, {
    params: { q: `${city},IN`, appid: env.weather.apiKey, units: 'metric', cnt: 8 },
    timeout: 6000,
  });

  return {
    city,
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: data.weather[0]?.main,
    description: data.weather[0]?.description,
    icon: data.weather[0]?.icon,
    humidity: data.main.humidity,
    windSpeed: data.wind?.speed,
    forecast: (forecastData?.list || []).map((f) => ({
      time: f.dt_txt,
      temperature: Math.round(f.main.temp),
      condition: f.weather[0]?.main,
      icon: f.weather[0]?.icon,
    })),
    isMock: false,
    provider: 'openweather',
  };
}

/** Deterministic demo weather so the app works with zero configuration. */
function mockWeatherProvider(city) {
  const seed = city.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const conditions = ['Clear', 'Clouds', 'Rain', 'Haze'];
  const condition = conditions[seed % conditions.length];
  const baseTemp = 22 + (seed % 12);

  const forecast = Array.from({ length: 5 }).map((_, i) => ({
    time: new Date(Date.now() + i * 86400000).toDateString(),
    temperature: baseTemp + ((seed + i) % 5) - 2,
    condition: conditions[(seed + i) % conditions.length],
    icon: '01d',
  }));

  return {
    city,
    temperature: baseTemp,
    feelsLike: baseTemp + 1,
    condition,
    description: `${condition.toLowerCase()} skies (demo data)`,
    icon: '01d',
    humidity: 55 + (seed % 20),
    windSpeed: 3 + (seed % 5),
    forecast,
    isMock: true,
    provider: 'mock',
  };
}

async function getWeather(city) {
  if (!city) throw new Error('City is required for weather lookup.');

  if (env.weather.provider === 'openweather' && env.weather.apiKey) {
    try {
      return await openWeatherProvider(city);
    } catch (err) {
      logger.warn(`OpenWeather call failed, degrading to mock: ${err.message}`);
      const mock = mockWeatherProvider(city);
      mock.degraded = true;
      mock.degradedReason = 'Weather service is temporarily unavailable. You can continue planning without live weather.';
      return mock;
    }
  }

  return mockWeatherProvider(city);
}

module.exports = { getWeather };

const rateLimit = require('express-rate-limit');
const env = require('../config/env');

/** General API limiter — generous, just guards against abuse. */
const apiLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please slow down and try again shortly.' },
});

/** Tighter limiter for auth endpoints (register/login/otp) to slow brute force. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please wait a few minutes and try again.' },
});

/** Stricter limiter for AI generation (expensive Gemini calls). */
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many AI requests. Please wait a few minutes before generating another itinerary.' },
});

module.exports = { apiLimiter, authLimiter, aiLimiter };

/**
 * env.js
 * -----------------------------------------------------------------
 * Centralised environment configuration. Every other module reads
 * config from here instead of calling `process.env` directly, so
 * defaults and validation live in exactly one place.
 * -----------------------------------------------------------------
 */
require('dotenv').config();

const required = ['DATABASE_URL', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  // We warn instead of hard-crashing so `prisma validate` / tooling
  // that imports this file without a full .env doesn't explode.
  // server.js performs the real startup check.
  // eslint-disable-next-line no-console
  console.warn(`[env] Missing environment variables: ${missing.join(', ')}`);
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  databaseUrl: process.env.DATABASE_URL,

  jwtSecret: process.env.JWT_SECRET || 'dev_insecure_secret_change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // "Continue with Google" sign-in — same public Client ID used by the
  // frontend (VITE_GOOGLE_CLIENT_ID) to render the button; the backend
  // uses it only as the expected `audience` when verifying the ID token
  // Google hands back. No client secret is needed for this flow.
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',

  otpDevMode: (process.env.OTP_DEV_MODE || 'true') === 'true',
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES, 10) || 10,

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  },

  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || '',

  weather: {
    provider: process.env.WEATHER_PROVIDER || 'mock',
    apiKey: process.env.OPENWEATHER_API_KEY || '',
  },

  booking: {
    // "mock"    -> deterministic demo inventory (default, no key needed)
    // "rapidapi" -> real hotel/flight search via RapidAPI-hosted travel
    //               APIs (falls back to mock automatically on any error)
    provider: process.env.BOOKING_PROVIDER || 'mock',
    rapidApiKey: process.env.RAPIDAPI_KEY || '',
    // Flights (Sky Scrapper) can use a DIFFERENT RapidAPI account/key than
    // Hotels (Booking.com) — on RapidAPI, a subscription is tied to a
    // specific application/key, and it's common for someone to end up
    // subscribing to a second API from a different account/app than the
    // one already used for hotels. Falls back to the main key if unset, so
    // nothing breaks for anyone who only ever used one key for everything.
    rapidApiFlightsKey: process.env.RAPIDAPI_FLIGHTS_KEY || process.env.RAPIDAPI_KEY || '',
    rapidApiHotelsHost: process.env.RAPIDAPI_HOTELS_HOST || 'booking-com.p.rapidapi.com',
    rapidApiFlightsHost: process.env.RAPIDAPI_FLIGHTS_HOST || 'sky-scrapper.p.rapidapi.com',
  },

  payment: {
    // "mock"     -> simulated UPI intent + simulated verify (default)
    // "razorpay" -> real Razorpay test-mode order + Checkout + signature verify
    provider: process.env.PAYMENT_PROVIDER || 'mock',
    apiKey: process.env.PAYMENT_API_KEY || '',
    upiPayeeVpa: process.env.UPI_PAYEE_VPA || 'intellitrip@upi',
    razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
    razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  },

  notifications: {
    emailApiKey: process.env.EMAIL_API_KEY || '',

    // Email OTP delivery: "mock" (console log, default) | "gmail" (real Nodemailer + Gmail SMTP)
    emailProvider: process.env.EMAIL_PROVIDER || 'mock',
    gmailUser: process.env.GMAIL_USER || '',
    gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
    emailFromName: process.env.EMAIL_FROM_NAME || 'IntelliTrip',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
  },
};

/**
 * app.js
 * -----------------------------------------------------------------
 * Builds and configures the Express application: security
 * middleware, route mounting, and error handling. `server.js` is the
 * thin file that actually starts listening — separating the two
 * makes the app importable/testable (e.g. supertest) without
 * binding a real port.
 * -----------------------------------------------------------------
 */
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const env = require('./config/env');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const destinationRoutes = require('./routes/destinationRoutes');
const placeRoutes = require('./routes/placeRoutes');
const aiRoutes = require('./routes/aiRoutes');
const tripRoutes = require('./routes/tripRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const safetyRoutes = require('./routes/safetyRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ---- Security & platform middleware ---------------------------------
app.use(helmet());

// CORS: always allow the configured CLIENT_URL. In development ALSO
// allow any http(s)://localhost:<port> / 127.0.0.1:<port> origin —
// Vite silently picks a different port (5174, 5175, ...) whenever its
// default port is already busy (e.g. a leftover dev server from a
// previous run), and a strict single-origin match would reject that
// with a confusing generic "Network Error" on every request. This
// stays production-safe: outside development, only CLIENT_URL is
// accepted, exactly as before.
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // same-origin requests / curl / health checks send no Origin header
      if (origin === env.clientUrl) return callback(null, true);
      if (env.nodeEnv !== 'production' && localhostOriginPattern.test(origin)) return callback(null, true);
      return callback(new Error(`CORS: origin "${origin}" is not allowed. Set CLIENT_URL in backend/.env to match it.`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv === 'development') {
  app.use(morgan('dev'));
}
app.use('/api', apiLimiter);

// ---- Health check ------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', service: 'IntelliTrip API', timestamp: new Date().toISOString() } });
});

// ---- Feature routes -----------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/hotels', inventoryRoutes.hotels);
app.use('/api/flights', inventoryRoutes.flights);
app.use('/api/cabs', inventoryRoutes.cabs);
app.use('/api/experiences', inventoryRoutes.experiences);
app.use('/api/restaurants', inventoryRoutes.restaurants);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/admin', adminRoutes);

// ---- 404 + centralized error handling ------------------------------
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

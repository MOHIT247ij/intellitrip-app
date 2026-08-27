/**
 * errorHandler.js
 * -----------------------------------------------------------------
 * Central error-handling middleware. Express recognises this as an
 * error handler because it takes 4 arguments (err, req, res, next).
 * Every thrown ApiError / Prisma error / Zod error / unexpected bug
 * funnels through here and is turned into the standard
 * { success: false, message } envelope — the client NEVER sees a
 * raw stack trace.
 * -----------------------------------------------------------------
 */
const logger = require('../config/logger');
const env = require('../config/env');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma known request errors (e.g. unique constraint violation)
  if (err.code && String(err.code).startsWith('P2')) {
    statusCode = 400;
    if (err.code === 'P2002') {
      const field = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target;
      message = `A record with this ${field || 'value'} already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'The requested record was not found.';
    } else {
      message = 'Database request could not be completed.';
    }
  }

  // Zod validation errors bubble up with an `issues` array
  if (err.name === 'ZodError' || Array.isArray(err.issues)) {
    statusCode = 422;
    message = err.issues?.map((i) => i.message).join('; ') || 'Validation failed';
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Invalid or expired session. Please log in again.';
  }

  if (!err.isApiError && statusCode >= 500) {
    logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.originalUrl });
    if (env.nodeEnv !== 'development') {
      message = 'Something went wrong on our end. Please try again shortly.';
    }
  } else {
    logger.warn(`${statusCode} ${req.method} ${req.originalUrl} — ${message}`);
  }

  res.status(statusCode).json({ success: false, message });
}

function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };

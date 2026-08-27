/**
 * ApiError — a typed error class so controllers can `throw` a clean,
 * user-facing error and let the central error-handling middleware
 * (middleware/errorHandler.js) translate it into the standard
 * { success: false, message } response — without ever leaking a
 * stack trace to the client.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isApiError = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;

/**
 * asyncHandler — wraps an async Express route/controller so any
 * rejected promise is forwarded to next(err) automatically, instead
 * of every controller needing its own try/catch.
 */
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;

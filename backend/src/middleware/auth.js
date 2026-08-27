/**
 * auth.js
 * -----------------------------------------------------------------
 * JWT authentication middleware.
 *
 * HOW LOGIN WORKS (viva note): after a successful login, the server
 * signs a JWT (JSON Web Token) containing { id, role } using
 * JWT_SECRET. The token is returned to the client, which stores it
 * (frontend uses localStorage via AuthContext) and sends it back on
 * every request as `Authorization: Bearer <token>`. This middleware
 * verifies the signature (proving it was issued by our server and
 * not tampered with) and attaches the decoded user to `req.user`.
 * Because the token is self-contained, the server does not need to
 * keep a session store — this is what makes JWT auth "stateless".
 * -----------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const prisma = require('../config/prisma');

const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'You must be logged in to access this resource.');
  }
  const token = header.split(' ')[1];

  let decoded;
  try {
    decoded = jwt.verify(token, env.jwtSecret);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired session. Please log in again.');
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user) {
    throw new ApiError(401, 'The account for this session no longer exists.');
  }

  req.user = user;
  next();
});

/** Restrict a route to one or more roles, e.g. authorize('ADMIN') */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  };
}

/** Attaches req.user if a valid token is present, but does not require it. */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(header.split(' ')[1], env.jwtSecret);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (user) req.user = user;
    } catch (err) {
      // ignore invalid token for optional auth
    }
  }
  next();
});

module.exports = { protect, authorize, optionalAuth };

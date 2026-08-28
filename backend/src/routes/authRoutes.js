/**
 * authRoutes.js
 * REST endpoints:
 *   POST /api/auth/register
 *   POST /api/auth/verify-otp
 *   POST /api/auth/resend-otp
 *   POST /api/auth/login
 *   POST /api/auth/forgot-password
 *   POST /api/auth/reset-password
 */
const express = require('express');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} = require('../validators/authValidators');

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/verify-otp', authLimiter, validate(verifyOtpSchema), authController.verifyOtpHandler);
router.post('/resend-otp', authLimiter, validate(resendOtpSchema), authController.resendOtpHandler);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/google', authLimiter, validate(googleAuthSchema), authController.googleAuthHandler);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPasswordHandler);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), authController.resetPasswordHandler);

module.exports = router;

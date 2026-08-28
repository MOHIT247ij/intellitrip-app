/**
 * authService.js
 * -----------------------------------------------------------------
 * All business logic for registration / OTP verification / login.
 * Controllers stay thin — they parse the request and call into this
 * service, then shape the HTTP response.
 * -----------------------------------------------------------------
 */
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../config/prisma');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const passwordUtils = require('../utils/passwordUtils');
const { generateOtp } = require('../utils/tokens');
const logger = require('../config/logger');
const emailProvider = require('../integrations/email.provider');

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function sanitizeUser(user) {
  // eslint-disable-next-line no-unused-vars
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * Registration flow:
 *   1. Reject if email/mobile already exists.
 *   2. Hash the password with bcrypt (never store plain text).
 *   3. Create the user as unverified.
 *   4. Generate a 6-digit OTP, HASH it (bcrypt) before storing —
 *      even the OTP is never persisted in plain text — and send it
 *      via the configured channel. In OTP_DEV_MODE we log it to the
 *      console and also return it in the API response so the college
 *      demo doesn't require a real Email provider.
 */
async function register({ fullName, email, mobile, password }) {
  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { mobile }] } });
  if (existing) {
    throw new ApiError(409, 'An account with this email or mobile number already exists.');
  }

  const passwordHash = await passwordUtils.hash(password);
  const user = await prisma.user.create({
    data: { fullName, email, mobile, passwordHash, isVerified: false },
  });

  const { devOtp, delivery } = await issueOtp(user, 'REGISTRATION');

  return { user: sanitizeUser(user), devOtp, delivery };
}

/**
 * issueOtp — creates + stores a hashed OTP for `user`, then attempts
 * real delivery by email (EMAIL_PROVIDER=gmail sends to user.email).
 * Real delivery is attempted independently of OTP_DEV_MODE —
 * OTP_DEV_MODE only controls whether the plaintext OTP is also
 * echoed back in the API response (`devOtp`) for on-screen
 * convenience during local/college demos. Delivery failures never
 * throw; they're reported in the returned `delivery` object so the
 * caller/logs can see what happened without breaking the auth flow.
 */
async function issueOtp(user, purpose) {
  const userId = user.id;
  const otp = generateOtp(6);
  const otpHash = await passwordUtils.hash(otp);
  const expiresAt = new Date(Date.now() + env.otpExpiryMinutes * 60 * 1000);

  await prisma.otpVerification.updateMany({
    where: { userId, purpose, consumed: false },
    data: { consumed: true }, // invalidate any previous unconsumed OTPs
  });

  await prisma.otpVerification.create({
    data: { userId, otpHash, purpose, expiresAt },
  });

  if (env.otpDevMode) {
    logger.info(`[DEV OTP] userId=${userId} purpose=${purpose} otp=${otp} (valid ${env.otpExpiryMinutes} min)`);
  }

  // Gmail SMTP can occasionally take a long time to connect/respond from
  // some hosting networks (Render's free tier included) — long enough to
  // blow past the frontend's request timeout even though the OTP itself
  // was already created and the email eventually goes out. Race the send
  // against a short timeout so register/login/etc. never hang the HTTP
  // response on mail delivery; the send keeps running in the background
  // and its own success/failure is logged either way.
  const emailPromise = emailProvider.sendOtpEmail({
    to: user.email,
    name: user.fullName,
    otp,
    purpose,
    expiryMinutes: env.otpExpiryMinutes,
  });
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(() => resolve({ sent: false, pending: true }), 8000);
  });
  const emailResult = await Promise.race([emailPromise, timeoutPromise]);

  return {
    otp,
    devOtp: env.otpDevMode ? otp : undefined,
    delivery: { email: emailResult },
  };
}

async function verifyOtp({ userId, otp }) {
  const record = await prisma.otpVerification.findFirst({
    where: { userId, consumed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) throw new ApiError(400, 'No pending OTP found. Please request a new one.');
  if (record.expiresAt < new Date()) throw new ApiError(400, 'This OTP has expired. Please request a new one.');
  if (record.attempts >= 5) throw new ApiError(429, 'Too many incorrect attempts. Please request a new OTP.');

  const isMatch = await passwordUtils.compare(otp, record.otpHash);
  if (!isMatch) {
    await prisma.otpVerification.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw new ApiError(400, 'Incorrect OTP. Please try again.');
  }

  await prisma.otpVerification.update({ where: { id: record.id }, data: { consumed: true } });
  const user = await prisma.user.update({ where: { id: userId }, data: { isVerified: true } });

  // Ensure an empty preference row exists so profile/AI planner can update it later
  await prisma.userPreference.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

async function resendOtp(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new ApiError(404, 'User not found.');
  if (user.isVerified) throw new ApiError(400, 'This account is already verified.');
  const { devOtp, delivery } = await issueOtp(user, 'REGISTRATION');
  return { devOtp, delivery };
}

/**
 * forgotPassword — looks up the account by email and issues a
 * PASSWORD_RESET OTP (reuses the same hashed-OTP + email-delivery
 * pipeline as registration/login). Returns the userId so the
 * frontend can carry it into the reset-password step, exactly like
 * the register -> verify-otp flow already does.
 */
async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email: (email || '').trim().toLowerCase() } });
  if (!user) throw new ApiError(404, 'No account found with that email address.');
  const { devOtp, delivery } = await issueOtp(user, 'PASSWORD_RESET');
  return { userId: user.id, devOtp, delivery };
}

/**
 * resetPassword — verifies the PASSWORD_RESET OTP (mirrors verifyOtp's
 * checks: expiry, attempt limit, hash compare) without touching
 * isVerified/userPreference, then hashes + saves the new password and
 * logs the user in.
 */
async function resetPassword({ userId, otp, newPassword }) {
  const record = await prisma.otpVerification.findFirst({
    where: { userId, purpose: 'PASSWORD_RESET', consumed: false },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) throw new ApiError(400, 'No pending password reset request found. Please start again.');
  if (record.expiresAt < new Date()) throw new ApiError(400, 'This OTP has expired. Please request a new one.');
  if (record.attempts >= 5) throw new ApiError(429, 'Too many incorrect attempts. Please request a new OTP.');

  const isMatch = await passwordUtils.compare(otp, record.otpHash);
  if (!isMatch) {
    await prisma.otpVerification.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    throw new ApiError(400, 'Incorrect OTP. Please try again.');
  }

  await prisma.otpVerification.update({ where: { id: record.id }, data: { consumed: true } });

  const passwordHash = await passwordUtils.hash(newPassword);
  const user = await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

/**
 * googleAuth — "Continue with Google" sign-in/sign-up.
 *
 * The frontend uses Google Identity Services to get a signed ID token
 * ("credential") directly from Google — we never see the user's Google
 * password. Here we verify that token really came from Google and was
 * issued for OUR app (audience = env.googleClientId), then:
 *   - if a user with that email already exists, log them in (and mark
 *     verified, since Google already verified the email for us);
 *   - otherwise create a brand-new account. Google doesn't give us a
 *     phone number, but `mobile` is a required/unique column, so we
 *     fill it with a generated placeholder — the account still works
 *     fully via Google sign-in; the user can add a real number later
 *     from their Profile page if the app needs one for anything.
 */
async function googleAuth({ credential }) {
  // Lazy require so the app still boots (mock/dev mode) even before
  // `npm install` has pulled in google-auth-library.
  // eslint-disable-next-line global-require
  const { OAuth2Client } = require('google-auth-library');
  if (!env.googleClientId) {
    throw new ApiError(500, 'Google sign-in is not configured on the server (missing GOOGLE_CLIENT_ID).');
  }

  const client = new OAuth2Client(env.googleClientId);
  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.googleClientId });
    payload = ticket.getPayload();
  } catch (err) {
    throw new ApiError(401, 'Could not verify Google sign-in. Please try again.');
  }

  if (!payload?.email) throw new ApiError(400, 'Google account has no email address.');
  const email = payload.email.toLowerCase();

  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const placeholderMobile = `g${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
    const randomPasswordHash = await passwordUtils.hash(crypto.randomBytes(24).toString('hex'));
    user = await prisma.user.create({
      data: {
        fullName: payload.name || email.split('@')[0],
        email,
        mobile: placeholderMobile,
        passwordHash: randomPasswordHash,
        isVerified: true,
        profileImage: payload.picture || null,
      },
    });
    await prisma.userPreference.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
  } else if (!user.isVerified) {
    user = await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } });
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

/** Login supports identifier = email OR mobile number. */
async function login({ identifier, password }) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier.toLowerCase() }, { mobile: identifier }] },
  });

  if (!user) throw new ApiError(401, 'Invalid credentials.');

  const isMatch = await passwordUtils.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, 'Invalid credentials.');

  if (!user.isVerified) {
    const { devOtp, delivery } = await issueOtp(user, 'LOGIN');
    return {
      requiresVerification: true,
      userId: user.id,
      devOtp,
      delivery,
      message: 'Account not verified. A new OTP has been sent.',
    };
  }

  const token = signToken(user);
  return { user: sanitizeUser(user), token };
}

module.exports = { register, verifyOtp, resendOtp, login, googleAuth, forgotPassword, resetPassword, sanitizeUser, signToken };

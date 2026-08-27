/**
 * subscriptionController.js
 * -----------------------------------------------------------------
 * IntelliTrip Premium — a recurring membership on top of the existing
 * one-time booking payments (payment.provider.js / paymentController.js).
 *   GET  /api/subscription/plan   — public: plan details for a pricing page
 *   POST /api/subscription/create — protected: opens a subscription
 *                                    (mock instant, or real Razorpay TEST
 *                                    MODE recurring subscription)
 *   POST /api/subscription/verify — protected: verifies the payment and
 *                                    flips the user to Premium
 * -----------------------------------------------------------------
 */
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');
const { sanitizeUser } = require('../services/authService');
const logger = require('../config/logger');
const paymentProvider = require('../integrations/payment.provider');

const getPlan = asyncHandler(async (req, res) => {
  success(res, { plan: paymentProvider.PREMIUM_PLAN });
});

const createSubscription = asyncHandler(async (req, res) => {
  if (req.user.isPremium) throw new ApiError(400, 'You already have an active Premium membership.');

  let result;
  if (paymentProvider.isRazorpayMode()) {
    try {
      result = await paymentProvider.createRealSubscription();
    } catch (err) {
      // Same "never dead-end the flow" fallback as one-time bookings.
      logger.warn(`[Razorpay] createRealSubscription failed, falling back to mock: ${err.message}`);
      result = paymentProvider.createMockSubscription();
    }
  } else {
    result = paymentProvider.createMockSubscription();
  }

  success(res, { ...result, plan: paymentProvider.PREMIUM_PLAN }, 201);
});

const verifySubscription = asyncHandler(async (req, res) => {
  const {
    subscriptionId,
    isMock,
    simulateResult,
    razorpay_subscription_id: razorpaySubscriptionId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature,
  } = req.body;

  let result;
  if (!isMock && razorpaySubscriptionId && razorpayPaymentId) {
    result = paymentProvider.verifyRealSubscription({ razorpaySubscriptionId, razorpayPaymentId, razorpaySignature });
  } else {
    result = { status: simulateResult === 'FAILED' ? 'FAILED' : 'SUCCESS' };
  }

  if (result.status !== 'SUCCESS') {
    throw new ApiError(400, 'Payment could not be verified. Your card/UPI was not charged.');
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      isPremium: true,
      premiumPlan: paymentProvider.PREMIUM_PLAN.name,
      premiumSince: new Date(),
      razorpaySubscriptionId: razorpaySubscriptionId || subscriptionId || null,
    },
  });

  success(res, { user: toPlain(sanitizeUser(user)) });
});

module.exports = { getPlan, createSubscription, verifySubscription };

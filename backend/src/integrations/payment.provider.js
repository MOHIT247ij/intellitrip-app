/**
 * payment.provider.js
 * -----------------------------------------------------------------
 * Provider abstraction:  PaymentProvider
 *                          ├── MockPaymentProvider     (simulated UPI flow, clearly labeled)
 *                          └── RazorpayPaymentProvider (real Razorpay TEST MODE order +
 *                                                        Checkout + signature verification)
 *
 * ARCHITECTURE (UPI / payment gateway flow — see README for the full
 * diagram):
 *   Booking -> Review -> Confirm -> payment intent/order created ->
 *   UPI app / Payment Gateway -> Payment result callback ->
 *   backend verification -> booking confirmation
 *
 * We deliberately do NOT implement a fake card entry form (per spec).
 * In mock mode, `createIntent` returns a UPI payment intent (a
 * upi:// deep link shape) the frontend renders as a QR / "Pay via
 * UPI app" button, and `verify` simulates the gateway's server-to-
 * server callback — no real money moves, every mock payment is
 * tagged isMock: true.
 *
 * In "razorpay" mode (PAYMENT_PROVIDER=razorpay + RAZORPAY_KEY_ID/
 * RAZORPAY_KEY_SECRET set to TEST keys from
 * https://dashboard.razorpay.com/app/keys), `createRealOrder` opens
 * a genuine Razorpay order and the frontend launches the real
 * Razorpay Checkout widget (supports UPI, cards, netbanking, wallets
 * — all in TEST MODE, so no real money moves either, but the flow is
 * the actual gateway redirect/popup instead of a simulated button).
 * `verifyRealPayment` re-computes the HMAC-SHA256 signature exactly
 * as Razorpay does server-side — this is the only trustworthy way to
 * confirm a payment; the client-side callback alone must never be
 * trusted.
 * -----------------------------------------------------------------
 */
const crypto = require('crypto');
const env = require('../config/env');
const { generateRef } = require('../utils/tokens');
const logger = require('../config/logger');

let Razorpay;
try {
  // eslint-disable-next-line global-require
  Razorpay = require('razorpay');
} catch (err) {
  Razorpay = null;
}

let cachedInstance = null;
function getRazorpayInstance() {
  if (cachedInstance) return cachedInstance;
  if (!Razorpay) throw new Error('razorpay package is not installed. Run `npm install` in /backend.');
  if (!env.payment.razorpayKeyId || !env.payment.razorpayKeySecret) {
    throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are not configured.');
  }
  cachedInstance = new Razorpay({ key_id: env.payment.razorpayKeyId, key_secret: env.payment.razorpayKeySecret });
  return cachedInstance;
}

function isRazorpayMode() {
  return env.payment.provider === 'razorpay';
}

/** Mock UPI intent — unchanged behaviour when PAYMENT_PROVIDER=mock. */
function createIntent({ amount, payeeVpa }) {
  const ref = generateRef('UPI');
  const vpa = payeeVpa || env.payment.upiPayeeVpa;
  const upiUri = `upi://pay?pa=${vpa}&pn=IntelliTrip&am=${amount}&cu=INR&tr=${ref}`;
  return { transactionRef: ref, upiUri, isMock: true, provider: 'MockPaymentProvider' };
}

/**
 * verify — simulates the gateway confirming a payment. In mock mode,
 * result is deterministic unless the caller explicitly simulates a
 * failure (useful for the frontend to demo a failed-payment state).
 */
function verify({ transactionRef, simulateResult }) {
  const status = simulateResult === 'FAILED' ? 'FAILED' : 'SUCCESS';
  return { status, transactionRef, verifiedAt: new Date(), isMock: true, provider: 'MockPaymentProvider' };
}

/**
 * createRealOrder — opens a real Razorpay TEST MODE order. Amount is
 * rupees (converted to paise, Razorpay's smallest unit, internally).
 * If anything goes wrong (missing keys, network, invalid amount) we
 * throw — the caller (paymentController) falls back to the mock UPI
 * intent so the booking flow never dead-ends.
 */
async function createRealOrder({ amount, receipt }) {
  const instance = getRazorpayInstance();
  const order = await instance.orders.create({
    amount: Math.round(Number(amount) * 100), // paise
    currency: 'INR',
    receipt: receipt || generateRef('RCPT'),
    notes: { app: 'IntelliTrip' },
  });
  return {
    orderId: order.id,
    amount: Number(amount),
    currency: order.currency,
    keyId: env.payment.razorpayKeyId,
    isMock: false,
    provider: 'RazorpayPaymentProvider',
  };
}

/**
 * verifyRealPayment — recomputes HMAC-SHA256(order_id + "|" +
 * payment_id, key_secret) and compares it (constant-time) against
 * the signature Razorpay's Checkout handler returned. This is the
 * standard, documented way to verify a Razorpay payment server-side.
 */
function verifyRealPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  if (!env.payment.razorpayKeySecret) throw new Error('RAZORPAY_KEY_SECRET is not configured.');

  const expected = crypto
    .createHmac('sha256', env.payment.razorpayKeySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(razorpaySignature || '', 'hex'));
  } catch (err) {
    valid = false; // malformed/short signature -> definitely invalid
  }

  return {
    status: valid ? 'SUCCESS' : 'FAILED',
    transactionRef: razorpayPaymentId,
    verifiedAt: new Date(),
    isMock: false,
    provider: 'RazorpayPaymentProvider',
  };
}

/**
 * ---------------------------------------------------------------------
 * Premium membership subscription (recurring billing)
 * ---------------------------------------------------------------------
 * Same mock/real split as the one-time booking payments above, but uses
 * Razorpay's Subscriptions product instead of a one-off Order: a Plan is
 * created once (and cached in memory — recreating it on every request
 * would spam duplicate plans on the Razorpay dashboard) and a
 * Subscription is opened against it per user. Signature verification
 * for a subscription payment uses a slightly different HMAC input than
 * a one-time order (payment_id + subscription_id, not + order_id) —
 * see https://razorpay.com/docs/payments/subscriptions/verify-payments/
 * ---------------------------------------------------------------------
 */
const PREMIUM_PLAN = {
  name: 'IntelliTrip Premium',
  description: 'Unlimited AI trip planning, priority itinerary regeneration & early access to new features.',
  amountRupees: 199,
  currency: 'INR',
  period: 'monthly',
  interval: 1,
};

let cachedPlanId = null;

/** Creates the Razorpay Plan once and reuses it on every later call. */
async function getOrCreatePlan() {
  if (cachedPlanId) return cachedPlanId;
  const instance = getRazorpayInstance();
  const plan = await instance.plans.create({
    period: PREMIUM_PLAN.period,
    interval: PREMIUM_PLAN.interval,
    item: {
      name: PREMIUM_PLAN.name,
      amount: PREMIUM_PLAN.amountRupees * 100, // paise
      currency: PREMIUM_PLAN.currency,
      description: PREMIUM_PLAN.description,
    },
  });
  cachedPlanId = plan.id;
  return cachedPlanId;
}

/** Mock subscription — always "succeeds" instantly, clearly tagged isMock. */
function createMockSubscription() {
  return { subscriptionId: generateRef('SUB'), isMock: true, provider: 'MockPaymentProvider' };
}

/**
 * createRealSubscription — opens a real Razorpay TEST MODE subscription
 * against the (cached) Premium plan. `total_count: 12` is required by
 * Razorpay's API (max billing cycles before the subscription needs
 * renewal) — 12 monthly cycles = 1 year, then it can be re-subscribed.
 */
async function createRealSubscription() {
  const instance = getRazorpayInstance();
  const planId = await getOrCreatePlan();
  const subscription = await instance.subscriptions.create({
    plan_id: planId,
    customer_notify: 1,
    total_count: 12,
  });
  return {
    subscriptionId: subscription.id,
    keyId: env.payment.razorpayKeyId,
    isMock: false,
    provider: 'RazorpayPaymentProvider',
  };
}

/**
 * verifyRealSubscription — recomputes HMAC-SHA256(payment_id + "|" +
 * subscription_id, key_secret), the documented signature formula for a
 * subscription's first payment (different input order than a one-time
 * order's signature, which uses order_id).
 */
function verifyRealSubscription({ razorpaySubscriptionId, razorpayPaymentId, razorpaySignature }) {
  if (!env.payment.razorpayKeySecret) throw new Error('RAZORPAY_KEY_SECRET is not configured.');

  const expected = crypto
    .createHmac('sha256', env.payment.razorpayKeySecret)
    .update(`${razorpayPaymentId}|${razorpaySubscriptionId}`)
    .digest('hex');

  let valid = false;
  try {
    valid = crypto.timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(razorpaySignature || '', 'hex'));
  } catch (err) {
    valid = false;
  }

  return { status: valid ? 'SUCCESS' : 'FAILED', isMock: false };
}

module.exports = {
  isRazorpayMode,
  createIntent,
  verify,
  createRealOrder,
  verifyRealPayment,
  PREMIUM_PLAN,
  createMockSubscription,
  createRealSubscription,
  verifyRealSubscription,
};

/**
 * paymentController.js
 * -----------------------------------------------------------------
 * POST /api/payments/create  — booking -> review -> confirm -> create a
 *                               payment intent (mock UPI, or a real
 *                               Razorpay TEST MODE order when
 *                               PAYMENT_PROVIDER=razorpay)
 * POST /api/payments/verify  — verify the payment (simulated callback in
 *                               mock mode; real HMAC signature check for
 *                               Razorpay), then confirm/fail the linked
 *                               booking
 * -----------------------------------------------------------------
 */
const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const prisma = require('../config/prisma');
const { toPlain } = require('../utils/serializers');
const logger = require('../config/logger');
const paymentProvider = require('../integrations/payment.provider');

const createPayment = asyncHandler(async (req, res) => {
  const { bookingId, upiId } = req.body;

  const booking = await prisma.booking.findFirst({ where: { id: bookingId, userId: req.user.id } });
  if (!booking) throw new ApiError(404, 'Booking not found.');
  if (booking.status === 'CONFIRMED') throw new ApiError(400, 'This booking is already confirmed.');

  let intent;
  if (paymentProvider.isRazorpayMode()) {
    try {
      const order = await paymentProvider.createRealOrder({
        amount: Number(booking.totalAmount),
        receipt: `booking_${booking.id}`,
      });
      intent = {
        transactionRef: order.orderId,
        razorpayOrderId: order.orderId,
        razorpayKeyId: order.keyId,
        amount: order.amount,
        currency: order.currency,
        isMock: false,
        provider: order.provider,
      };
    } catch (err) {
      // Razorpay not configured / unreachable -> gracefully degrade to
      // the mock UPI flow rather than dead-ending the booking.
      logger.warn(`[Razorpay] createRealOrder failed, falling back to mock: ${err.message}`);
      intent = paymentProvider.createIntent({ amount: Number(booking.totalAmount), payeeVpa: upiId });
    }
  } else {
    intent = paymentProvider.createIntent({ amount: Number(booking.totalAmount), payeeVpa: upiId });
  }

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: {
      amount: booking.totalAmount,
      status: 'INITIATED',
      transactionRef: intent.transactionRef,
      upiId: upiId || null,
      provider: intent.provider,
    },
    create: {
      bookingId,
      userId: req.user.id,
      amount: booking.totalAmount,
      status: 'INITIATED',
      transactionRef: intent.transactionRef,
      upiId: upiId || null,
      provider: intent.provider,
    },
  });

  success(
    res,
    {
      payment: toPlain(payment),
      isMock: intent.isMock,
      // Mock-mode fields
      upiUri: intent.upiUri,
      // Razorpay-mode fields (undefined in mock mode)
      razorpayOrderId: intent.razorpayOrderId,
      razorpayKeyId: intent.razorpayKeyId,
      amount: intent.amount,
      currency: intent.currency,
    },
    201
  );
});

const verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId, transactionRef, simulateResult, razorpay_order_id: razorpayOrderId, razorpay_payment_id: razorpayPaymentId, razorpay_signature: razorpaySignature } = req.body;

  const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId: req.user.id } });
  if (!payment) throw new ApiError(404, 'Payment not found.');

  let result;
  if (payment.provider === 'RazorpayPaymentProvider' && razorpayPaymentId) {
    result = paymentProvider.verifyRealPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  } else {
    result = paymentProvider.verify({ transactionRef, simulateResult });
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: result.status, verifiedAt: result.verifiedAt, transactionRef: result.transactionRef || transactionRef },
  });

  const booking = await prisma.booking.update({
    where: { id: payment.bookingId },
    data: { status: result.status === 'SUCCESS' ? 'CONFIRMED' : 'FAILED' },
  });

  success(res, { payment: toPlain(updatedPayment), booking: toPlain(booking) });
});

module.exports = { createPayment, verifyPayment };

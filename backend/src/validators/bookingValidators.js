const { z } = require('zod');

const createBookingSchema = z.object({
  tripId: z.number().int().positive().optional(),
  type: z.enum(['HOTEL', 'FLIGHT', 'CAB', 'EXPERIENCE']),
  items: z
    .array(
      z.object({
        itemName: z.string().trim().min(1),
        description: z.string().optional(),
        quantity: z.number().int().min(1).default(1),
        unitPrice: z.number().min(0),
        metadata: z.record(z.any()).optional(),
      })
    )
    .min(1, 'At least one item is required to create a booking'),
});

const createPaymentSchema = z.object({
  bookingId: z.number().int().positive(),
  upiId: z.string().trim().min(3).optional(),
});

const verifyPaymentSchema = z
  .object({
    paymentId: z.number().int().positive(),
    // Mock-mode fields
    transactionRef: z.string().trim().min(3).optional(),
    simulateResult: z.enum(['SUCCESS', 'FAILED']).optional(),
    // Razorpay-mode fields — returned by the Razorpay Checkout success handler
    razorpay_order_id: z.string().trim().min(3).optional(),
    razorpay_payment_id: z.string().trim().min(3).optional(),
    razorpay_signature: z.string().trim().min(3).optional(),
  })
  .refine(
    (data) => Boolean(data.transactionRef) || Boolean(data.razorpay_order_id && data.razorpay_payment_id && data.razorpay_signature),
    { message: 'Provide either transactionRef (mock mode) or the razorpay_order_id/razorpay_payment_id/razorpay_signature trio (Razorpay mode).' }
  );

module.exports = { createBookingSchema, createPaymentSchema, verifyPaymentSchema };

const { z } = require('zod');

const verifySubscriptionSchema = z.object({
  subscriptionId: z.string().trim().min(3).optional(),
  isMock: z.boolean().optional(),
  // Mock-mode
  simulateResult: z.enum(['SUCCESS', 'FAILED']).optional(),
  // Razorpay-mode — returned by the Razorpay Checkout success handler
  razorpay_subscription_id: z.string().trim().min(3).optional(),
  razorpay_payment_id: z.string().trim().min(3).optional(),
  razorpay_signature: z.string().trim().min(3).optional(),
});

module.exports = { verifySubscriptionSchema };

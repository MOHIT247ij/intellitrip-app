const { z } = require('zod');

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(120),
    email: z.string().trim().toLowerCase().email('Enter a valid email address'),
    mobile: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const verifyOtpSchema = z.object({
  userId: z.number().int().positive(),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

const resendOtpSchema = z.object({
  userId: z.number().int().positive(),
});

const loginSchema = z
  .object({
    identifier: z.string().trim().min(3, 'Enter your email or mobile number'),
    password: z.string().min(1, 'Password is required'),
  });

const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address'),
});

const resetPasswordSchema = z
  .object({
    userId: z.number().int().positive(),
    otp: z.string().length(6, 'OTP must be 6 digits'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain an uppercase letter')
      .regex(/[0-9]/, 'Password must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

module.exports = {
  registerSchema,
  verifyOtpSchema,
  resendOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};

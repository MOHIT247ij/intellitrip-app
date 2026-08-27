const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/apiResponse');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { confirmPassword, ...payload } = req.body;
  const result = await authService.register(payload);
  success(res, result, 201);
});

const verifyOtpHandler = asyncHandler(async (req, res) => {
  const result = await authService.verifyOtp(req.body);
  success(res, result);
});

const resendOtpHandler = asyncHandler(async (req, res) => {
  const result = await authService.resendOtp(req.body.userId);
  success(res, result);
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  if (result.requiresVerification) {
    return success(res, result, 200);
  }
  success(res, result);
});

const forgotPasswordHandler = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body.email);
  success(res, result);
});

const resetPasswordHandler = asyncHandler(async (req, res) => {
  const { confirmPassword, ...payload } = req.body;
  const result = await authService.resetPassword(payload);
  success(res, result);
});

module.exports = {
  register,
  verifyOtpHandler,
  resendOtpHandler,
  login,
  forgotPasswordHandler,
  resetPasswordHandler,
};

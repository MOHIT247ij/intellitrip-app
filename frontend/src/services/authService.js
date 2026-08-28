import api from './api';

export const authService = {
  register: (payload) => api.post('/auth/register', payload).then((r) => r.data.data),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload).then((r) => r.data.data),
  resendOtp: (userId) => api.post('/auth/resend-otp', { userId }).then((r) => r.data.data),
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  googleAuth: (credential) => api.post('/auth/google', { credential }).then((r) => r.data.data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((r) => r.data.data),
  me: () => api.get('/users/me').then((r) => r.data.data),
  updateProfile: (payload) => api.put('/users/profile', payload).then((r) => r.data.data),
};

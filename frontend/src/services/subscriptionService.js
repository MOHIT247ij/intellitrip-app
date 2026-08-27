import api from './api';

export const subscriptionService = {
  getPlan: () => api.get('/subscription/plan').then((r) => r.data.data),
  create: () => api.post('/subscription/create').then((r) => r.data.data),
  verify: (payload) => api.post('/subscription/verify', payload).then((r) => r.data.data),
};

import api from './api';

export const expenseService = {
  list: (tripId) => api.get('/expenses', { params: { tripId } }).then((r) => r.data.data),
  create: (payload) => api.post('/expenses', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/expenses/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/expenses/${id}`).then((r) => r.data.data),
};

import api from './api';

export const tripService = {
  planTrip: (payload) => api.post('/ai/plan', payload).then((r) => r.data.data),
  replanTrip: (payload) => api.post('/ai/replan', payload).then((r) => r.data.data),
  list: () => api.get('/trips').then((r) => r.data.data),
  get: (id) => api.get(`/trips/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/trips', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/trips/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/trips/${id}`).then((r) => r.data.data),
  // Fetched via the authenticated axios instance (not a plain <a href>)
  // because the backend route requires the Authorization: Bearer <jwt>
  // header, which a plain browser navigation never sends.
  exportPdf: async (id) => {
    const response = await api.get(`/trips/${id}/export-pdf`, { responseType: 'blob' });
    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^"]+)"?/);
    const filename = match ? match[1] : `trip-${id}.pdf`;
    return { blob: response.data, filename };
  },
};

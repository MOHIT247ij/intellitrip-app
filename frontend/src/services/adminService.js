import api from './api';

export const adminService = {
  stats: () => api.get('/admin/stats').then((r) => r.data.data),
  users: () => api.get('/admin/users').then((r) => r.data.data),
  bookings: () => api.get('/admin/bookings').then((r) => r.data.data),
  places: () => api.get('/admin/places').then((r) => r.data.data),
  trips: () => api.get('/admin/trips').then((r) => r.data.data),
  updateBookingStatus: (id, status) => api.put(`/admin/bookings/${id}/status`, { status }).then((r) => r.data.data),
};

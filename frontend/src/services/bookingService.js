import api from './api';

export const bookingService = {
  hotels: (destination) => api.get('/hotels', { params: { destination } }).then((r) => r.data.data),
  flights: (destination, from) => api.get('/flights', { params: { destination, from } }).then((r) => r.data.data),
  cabs: (destination) => api.get('/cabs', { params: { destination } }).then((r) => r.data.data),
  experiences: (destination) => api.get('/experiences', { params: { destination } }).then((r) => r.data.data),
  restaurants: (destination) => api.get('/restaurants', { params: { destination } }).then((r) => r.data.data),

  createBooking: (payload) => api.post('/bookings', payload).then((r) => r.data.data),
  listBookings: () => api.get('/bookings').then((r) => r.data.data),
  getBooking: (id) => api.get(`/bookings/${id}`).then((r) => r.data.data),

  createPayment: (payload) => api.post('/payments/create', payload).then((r) => r.data.data),
  verifyPayment: (payload) => api.post('/payments/verify', payload).then((r) => r.data.data),
};

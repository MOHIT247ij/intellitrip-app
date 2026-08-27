import api from './api';

export const catalogService = {
  listDestinations: (search) => api.get('/destinations', { params: { search } }).then((r) => r.data.data),
  getDestination: (id) => api.get(`/destinations/${id}`).then((r) => r.data.data),
  listPlaces: (filters) => api.get('/places', { params: filters }).then((r) => r.data.data),
  getPlace: (id) => api.get(`/places/${id}`).then((r) => r.data.data),
  getWeather: (city) => api.get('/weather', { params: { city } }).then((r) => r.data.data),
  getSafety: (city) => api.get('/safety', { params: { city } }).then((r) => r.data.data),
};

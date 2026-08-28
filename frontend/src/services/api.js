/**
 * api.js
 * -----------------------------------------------------------------
 * Single Axios instance shared by every service file. Attaches the
 * JWT (read from localStorage via AuthContext) to every request and
 * centralizes 401 handling (expired/invalid session -> log the user
 * out client-side).
 * -----------------------------------------------------------------
 */
import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// 60s (not 30s): the free hosting tier this API runs on (Render) spins the
// server down after 15 minutes of inactivity, and the first request after
// that can take 50+ seconds to wake it back up. A 30s timeout was firing
// "timeout of 30000ms exceeded" on that very first request even though the
// server was healthy and would have responded a few seconds later.
const api = axios.create({ baseURL: API_URL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('intellitrip_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('intellitrip_token');
      localStorage.removeItem('intellitrip_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    const wrapped = new Error(message);
    // Carried through so callers can special-case specific statuses (e.g.
    // 403 "Free plan limit reached" -> show an upgrade prompt) without
    // having to string-match the message. Every existing catch that only
    // reads err.message keeps working unchanged.
    wrapped.status = error.response?.status;
    return Promise.reject(wrapped);
  }
);

export default api;

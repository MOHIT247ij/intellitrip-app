/**
 * AuthContext.jsx
 * -----------------------------------------------------------------
 * Holds the logged-in user + JWT. The token is persisted to
 * localStorage so a refresh doesn't log the user out; api.js reads
 * it from there on every request. This is the standard "stateless
 * JWT auth" pattern explained in the README viva section.
 * -----------------------------------------------------------------
 */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('intellitrip_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('intellitrip_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem('intellitrip_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('intellitrip_token');
        localStorage.removeItem('intellitrip_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback((userData, token) => {
    localStorage.setItem('intellitrip_token', token);
    localStorage.setItem('intellitrip_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('intellitrip_token');
    localStorage.removeItem('intellitrip_user');
    setUser(null);
  }, []);

  const updateUser = useCallback((userData) => {
    localStorage.setItem('intellitrip_user', JSON.stringify(userData));
    setUser(userData);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: Boolean(user), login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

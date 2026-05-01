import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tm_token');
    if (token) {
      authAPI.me()
        .then((res) => setUser(res.data.user))
        .catch(() => {
          localStorage.removeItem('tm_token');
          localStorage.removeItem('tm_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem('tm_token', token);
    localStorage.setItem('tm_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const signup = useCallback(async (name, email, password, role) => {
    const res = await authAPI.signup({ name, email, password, role });
    const { token, user } = res.data;
    localStorage.setItem('tm_token', token);
    localStorage.setItem('tm_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};

import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('noe_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('noe_token'));
  const [loading, setLoading] = useState(false);

  const authed = !!token && !!user;

  async function handleLogin(email, password) {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setToken(data.token);
      setUser(data.user);
      return data;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await api.logout();
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, authed, loading, login: handleLogin, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (mode, payload) => {
    const d = await api(`/auth/${mode}`, { method: 'POST', body: payload });
    setToken(d.token);
    setUser(d.user);
  };
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authenticate, logout }}>{children}</AuthContext.Provider>
  );
}

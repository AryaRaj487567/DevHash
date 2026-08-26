import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('devhash_token'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const persistToken = (value) => {
    setToken(value);
    if (value) {
      localStorage.setItem('devhash_token', value);
    } else {
      localStorage.removeItem('devhash_token');
    }
  };

  const logout = () => {
    persistToken(null);
    setUser(null);
  };

  const fetchMe = async () => {
    const { data } = await api.get('/auth/me');
    setUser(data.data);
    return data.data;
  };

  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener('devhash:unauthorized', onUnauthorized);
    return () => window.removeEventListener('devhash:unauthorized', onUnauthorized);
  }, []);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setUser(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchMe()
      .catch(() => {
        if (!cancelled) {
          persistToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persistToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persistToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  };

  const updateUser = (nextUser) => setUser(nextUser);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),
      login,
      logout,
      register,
      updateUser,
      fetchMe,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};

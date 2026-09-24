import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { setUnauthorizedHandler, TOKEN_KEY } from '../api/client';

const USER_KEY = 'ums.user';
const AuthContext = createContext(null);

function tokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function loadSession() {
  const token = localStorage.getItem(TOKEN_KEY);
  const stored = localStorage.getItem(USER_KEY);
  if (!token || !stored || tokenExpired(token)) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return null;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/** Where each person lands after signing in. */
export function homePath(user) {
  if (user?.roles.includes('ADMIN')) return '/admin/users';
  if (user?.roles.includes('MANAGER')) return '/manager/team';
  return '/me';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadSession);
  const [notice, setNotice] = useState('');

  const logout = useCallback((message = '') => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setNotice(message);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    const session = { email: data.email, roles: data.roles };
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(session));
    setUser(session);
    setNotice('');
    return session;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout('Your session has expired. Sign in again.'));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      notice,
      login,
      logout,
      hasRole: (role) => Boolean(user?.roles.includes(role)),
    }),
    [user, notice, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

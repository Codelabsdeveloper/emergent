import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';

type AuthState = {
  loading: boolean;
  authenticated: boolean;
  username: string | null;
  mustChangePassword: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/me');
      setAuthenticated(Boolean(data.data.authenticated));
      setUsername(data.data.username ?? null);
      setMustChangePassword(Boolean(data.data.mustChangePassword));
    } catch {
      setAuthenticated(false);
      setUsername(null);
      setMustChangePassword(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await api.post('/admin/logout');
    setAuthenticated(false);
    setUsername(null);
    setMustChangePassword(false);
  }, []);

  const value = useMemo(
    () => ({ loading, authenticated, username, mustChangePassword, refresh, logout }),
    [loading, authenticated, username, mustChangePassword, refresh, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

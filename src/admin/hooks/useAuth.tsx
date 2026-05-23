import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthUser {
  username: string;
}

interface AuthContextValue {
  isAuthenticated: boolean;
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, inviteCode: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hsn_admin_token');
    const savedUser = localStorage.getItem('hsn_admin_user');
    if (!token) {
      setLoading(false);
      return;
    }
    if (savedUser) {
      try { setUser(JSON.parse(savedUser) as AuthUser); } catch { /* ignore */ }
    }
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('invalid');
        return res.json() as Promise<{ username: string }>;
      })
      .then((data) => {
        const u = { username: data.username };
        setUser(u);
        localStorage.setItem('hsn_admin_user', JSON.stringify(u));
      })
      .catch(() => {
        localStorage.removeItem('hsn_admin_token');
        localStorage.removeItem('hsn_admin_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: '登录失败' })) as { error?: string };
      throw new Error(data.error || '登录失败');
    }
    const data = await res.json() as { token: string };
    localStorage.setItem('hsn_admin_token', data.token);
    const u = { username };
    localStorage.setItem('hsn_admin_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const register = useCallback(async (username: string, password: string, inviteCode: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, inviteCode }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ error: '注册失败' })) as { error?: string };
      throw new Error(data.error || '注册失败');
    }
    const data = await res.json() as { token: string };
    localStorage.setItem('hsn_admin_token', data.token);
    const u = { username };
    localStorage.setItem('hsn_admin_user', JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('hsn_admin_token');
    localStorage.removeItem('hsn_admin_user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

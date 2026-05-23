// ============================================================
// API client — wraps fetch with auth and error handling
// ============================================================

const BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('hsn_admin_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    localStorage.removeItem('hsn_admin_token');
    localStorage.removeItem('hsn_admin_user');
    if (window.location.pathname !== '/admin/login' && window.location.pathname !== '/admin/register') {
      window.location.href = '/admin/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText })) as { error?: string };
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  async get<T>(path: string): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { headers });
    return handleResponse<T>(res);
  },

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse<T>(res);
  },

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    return handleResponse<T>(res);
  },

  async del<T = { ok: boolean }>(path: string): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { method: 'DELETE', headers });
    return handleResponse<T>(res);
  },

  async upload<T>(path: string, formData: FormData): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, { method: 'POST', headers, body: formData });
    return handleResponse<T>(res);
  },
};

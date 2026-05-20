// Thin fetch wrapper. Domain services call this when USE_MOCK is false.
// Unwraps the backend's { success, message, data } envelope and surfaces
// backend error messages on non-2xx responses.

import { API_BASE_URL } from './config';

const buildUrl = (path, query) => {
  const url = new URL(
    path.startsWith('http') ? path : `${API_BASE_URL}${path}`,
  );
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
};

const getAuthToken = () =>
  typeof window === 'undefined' ? null : localStorage.getItem('auth_token');

// Returns the raw fetch Response. Most callers want apiRequest(), which
// unwraps the JSON envelope; export download endpoints use this directly.
export const apiFetch = async (path, options = {}) => {
  const { query, headers, ...init } = options;
  const token = getAuthToken();
  return fetch(buildUrl(path, query), {
    ...init,
    headers: {
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });
};

export const apiRequest = async (path, options = {}) => {
  const res = await apiFetch(path, options);

  if (res.status === 204) return undefined;

  const ct = res.headers.get('content-type') ?? '';
  const isJson = ct.includes('application/json');
  const body = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const msg = body?.message || res.statusText || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  // Backend wraps responses as { success, message, data }. Unwrap when present;
  // otherwise return the body as-is (some endpoints may return raw JSON).
  if (body && typeof body === 'object' && 'success' in body) {
    return body.data;
  }
  return body;
};

// Simulate latency for mock responses so the UI shows loading states realistically.
export const mockDelay = (ms = 250) =>
  new Promise((r) => setTimeout(r, ms));

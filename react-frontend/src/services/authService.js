import { employees, management, teamLeads } from '@/data/mockData';
import { apiRequest, mockDelay } from './apiClient';
import { USE_MOCK } from './config';
import { userFromBackend } from './adapters';

const mockLogin = async ({ email }) => {
  await mockDelay(500);
  // Pick a mock user based on the local-part of the email so anyone can
  // explore the three roles without touching the backend. Falls back to the
  // first employee.
  const local = (email || '').split('@')[0].toLowerCase();
  let user;
  if (local.startsWith('mgmt') || local === 'management') {
    user = management[0];
  } else if (local.startsWith('lead') || local.startsWith('tl')) {
    user = teamLeads[0];
  } else {
    user = employees[0];
  }
  return { token: `mock-token-${user.id}`, user };
};

export const authService = {
  async login({ email, password }) {
    if (USE_MOCK) {
      const res = await mockLogin({ email });
      localStorage.setItem('auth_token', res.token);
      localStorage.setItem('auth_user', JSON.stringify(res.user));
      return res;
    }
    // Backend response shape: { user: {...}, token: '...' } wrapped in { success, data }.
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const user = userFromBackend(data.user);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return { token: data.token, user };
  },

  async logout() {
    // Backend has no /auth/logout — clearing local state is enough.
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  async getCurrentUser() {
    const cached = localStorage.getItem('auth_user');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // fall through and try the server
      }
    }
    if (USE_MOCK) return null;
    try {
      const me = await apiRequest('/auth/me');
      const user = userFromBackend(me);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },
};

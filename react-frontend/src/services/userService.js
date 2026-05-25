import { allUsers, employees, management, teamLeads } from '@/data/mockData';
import { apiRequest, mockDelay } from './apiClient';
import { USE_MOCK } from './config';
import {
  roleToBackend,
  userCreateToBackend,
  userFromBackend,
  userUpdateToBackend,
} from './adapters';

export const userService = {
  async getAll() {
    if (USE_MOCK) {
      await mockDelay();
      return allUsers();
    }
    const rows = await apiRequest('/users');
    return rows.map(userFromBackend);
  },

  async getEmployees() {
    if (USE_MOCK) {
      await mockDelay();
      return [...employees];
    }
    const rows = await apiRequest('/users', { query: { role: 'employee' } });
    return rows.map(userFromBackend);
  },

  async getById(id) {
    if (USE_MOCK) {
      await mockDelay(50);
      return allUsers().find((u) => u.id === id);
    }
    const row = await apiRequest(`/users/${id}`);
    return userFromBackend(row);
  },

  async getByTeam(teamId) {
    if (USE_MOCK) {
      await mockDelay();
      return employees.filter((e) => e.teamId === teamId);
    }
    const rows = await apiRequest('/users', {
      query: { team_id: teamId, role: 'employee' },
    });
    return rows.map(userFromBackend);
  },

  async create(payload) {
    if (USE_MOCK) {
      await mockDelay();
      const idPrefix =
        payload.role === 'employee'
          ? 'emp'
          : payload.role === 'teamLead'
            ? 'tl'
            : 'mgmt';
      const user = {
        id: `${idPrefix}${Date.now()}`,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        teamId: payload.teamId,
        designation: payload.designation,
        avatarUrl: payload.avatarUrl,
        joinedDate: new Date().toISOString(),
      };
      switch (payload.role) {
        case 'employee':
          employees.push(user);
          break;
        case 'teamLead':
          teamLeads.push(user);
          break;
        case 'management':
          management.push(user);
          break;
        default:
          break;
      }
      return user;
    }
    const row = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userCreateToBackend(payload)),
    });
    return userFromBackend(row);
  },

  async update(user) {
    if (USE_MOCK) {
      await mockDelay();
      const pools = [employees, teamLeads, management];
      for (const pool of pools) {
        const idx = pool.findIndex((u) => u.id === user.id);
        if (idx !== -1) {
          pool[idx] = user;
          return user;
        }
      }
      throw new Error(`User not found: ${user.id}`);
    }
    const row = await apiRequest(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(userUpdateToBackend(user)),
    });
    return userFromBackend(row);
  },

  async delete(id) {
    if (USE_MOCK) {
      await mockDelay();
      for (const pool of [employees, teamLeads, management]) {
        const idx = pool.findIndex((u) => u.id === id);
        if (idx !== -1) {
          pool.splice(idx, 1);
          return;
        }
      }
      throw new Error(`User not found: ${id}`);
    }
    await apiRequest(`/users/${id}`, { method: 'DELETE' });
  },

  // Admin password reset. Requires backend endpoint POST /users/:id/reset-password
  // (added in feat/admin-password-reset PR). Until that PR merges this will 404.
  async resetPassword(id, newPassword) {
    if (USE_MOCK) {
      await mockDelay();
      return;
    }
    await apiRequest(`/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    });
  },
};

// Re-export so callers that want the raw role mapping can use it.
export { roleToBackend };

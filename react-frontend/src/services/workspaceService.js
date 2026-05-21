import { workspaces } from '@/data/mockData';
import { apiRequest, mockDelay } from './apiClient';
import { USE_MOCK } from './config';
import {
  workspaceCreateToBackend,
  workspaceFromBackend,
} from './adapters';

// The member add/remove endpoints return only { success, message }, so after
// mutating we re-fetch the workspace to give the optimistic-update store a
// fresh object with the new memberIds in it.
const refetch = async (id) => {
  const row = await apiRequest(`/workspaces/${id}`);
  return workspaceFromBackend(row);
};

export const workspaceService = {
  async getAll() {
    if (USE_MOCK) {
      await mockDelay();
      return [...workspaces];
    }
    const rows = await apiRequest('/workspaces');
    const mapped = rows.map(workspaceFromBackend);
    // Some backend versions don't return member_ids on the list query (only
    // member_count). When that's the case, hydrate each workspace's members
    // via the detail endpoint so member dropdowns and avatar groups work.
    const needsHydration = mapped.some(
      (w) => (!w.memberIds || w.memberIds.length === 0) && w.totalTasks >= 0,
    );
    if (!needsHydration) return mapped;
    const detailed = await Promise.all(
      mapped.map(async (w) => {
        try {
          const detail = await apiRequest(`/workspaces/${w.id}`);
          const enriched = workspaceFromBackend(detail);
          return { ...w, memberIds: enriched.memberIds };
        } catch {
          return w; // keep partial info on failure rather than blanking the list
        }
      }),
    );
    return detailed;
  },

  async getById(id) {
    if (USE_MOCK) {
      await mockDelay(50);
      return workspaces.find((w) => w.id === id);
    }
    return refetch(id);
  },

  async create(payload) {
    if (USE_MOCK) {
      await mockDelay();
      const ws = {
        id: `ws${Date.now()}`,
        name: payload.name,
        description: payload.description,
        color: payload.color,
        icon: payload.icon,
        totalTasks: 0,
        completedTasks: 0,
        memberIds: payload.memberIds,
        projectCode: payload.projectCode.toUpperCase(),
        nextIssueNumber: 1,
      };
      workspaces.push(ws);
      return ws;
    }
    const row = await apiRequest('/workspaces', {
      method: 'POST',
      body: JSON.stringify(workspaceCreateToBackend(payload)),
    });
    // POST response doesn't include member_ids (it returns the bare insert row),
    // so refetch to pick up the members we just added.
    return refetch(row.id);
  },

  async addMember(workspaceId, userId) {
    if (USE_MOCK) {
      await mockDelay(100);
      const ws = workspaces.find((w) => w.id === workspaceId);
      if (!ws) throw new Error(`Workspace not found: ${workspaceId}`);
      if (!ws.memberIds.includes(userId)) {
        ws.memberIds = [...ws.memberIds, userId];
      }
      return ws;
    }
    await apiRequest(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: Number(userId) }),
    });
    return refetch(workspaceId);
  },

  async removeMember(workspaceId, userId) {
    if (USE_MOCK) {
      await mockDelay(100);
      const ws = workspaces.find((w) => w.id === workspaceId);
      if (!ws) throw new Error(`Workspace not found: ${workspaceId}`);
      ws.memberIds = ws.memberIds.filter((id) => id !== userId);
      return ws;
    }
    await apiRequest(`/workspaces/${workspaceId}/members/${userId}`, {
      method: 'DELETE',
    });
    return refetch(workspaceId);
  },
};

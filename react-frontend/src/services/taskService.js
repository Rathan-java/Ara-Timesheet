import { employees, tasks, workspaces } from '@/data/mockData';
import { apiRequest, mockDelay } from './apiClient';
import { USE_MOCK } from './config';
import { userService } from './userService';
import {
  statusToBackend,
  taskCreateToBackend,
  taskFromBackend,
  taskUpdateToBackend,
} from './adapters';

const findAssignee = (id) => userService.getById(id);

const findWorkspace = (id) => workspaces.find((w) => w.id === id);

export const taskService = {
  async getAll() {
    if (USE_MOCK) {
      await mockDelay();
      return [...tasks];
    }
    const rows = await apiRequest('/tasks');
    return rows.map(taskFromBackend);
  },

  async getByUser(userId) {
    if (USE_MOCK) {
      await mockDelay();
      return tasks.filter((t) => t.assigneeId === userId);
    }
    const rows = await apiRequest('/tasks', {
      query: { assignee_id: userId },
    });
    return rows.map(taskFromBackend);
  },

  async getByTeam(teamId) {
    if (USE_MOCK) {
      await mockDelay();
      const memberIds = new Set(
        employees.filter((e) => e.teamId === teamId).map((e) => e.id),
      );
      return tasks.filter((t) => memberIds.has(t.assigneeId));
    }
    // Backend filters by role automatically when caller is a team lead, so
    // the bare /tasks call returns team-scoped data. Fall back to assignee
    // filtering for callers that already know the user IDs.
    const rows = await apiRequest('/tasks');
    return rows.map(taskFromBackend);
  },

  async getByWorkspace(workspaceId) {
    if (USE_MOCK) {
      await mockDelay();
      return tasks.filter((t) => t.workspaceId === workspaceId);
    }
    const rows = await apiRequest('/tasks', {
      query: { workspace_id: workspaceId },
    });
    return rows.map(taskFromBackend);
  },

  async create(payload) {
    if (USE_MOCK) {
      await mockDelay();
      const ws = findWorkspace(payload.workspaceId);
      if (!ws) throw new Error(`Workspace not found: ${payload.workspaceId}`);
      const assignee = await findAssignee(payload.assigneeId);
      if (!assignee) throw new Error(`Assignee not found: ${payload.assigneeId}`);

      const issueNumber = ws.nextIssueNumber;
      ws.nextIssueNumber += 1;
      ws.totalTasks += 1;

      const initialStatus = payload.status ?? 'todo';
      if (initialStatus === 'done') ws.completedTasks += 1;

      const assignedBy = payload.assignedById
        ? await findAssignee(payload.assignedById)
        : null;

      const task = {
        id: `t${Date.now()}`,
        title: payload.title,
        description: payload.description,
        status: initialStatus,
        priority: payload.priority,
        assigneeId: assignee.id,
        assigneeName: assignee.name,
        workspaceId: ws.id,
        workspaceName: ws.name,
        createdAt: new Date().toISOString(),
        deadline: payload.deadline,
        assignedById: payload.assignedById,
        assignedByName: assignedBy?.name,
        estimatedHours: payload.estimatedHours,
        loggedHours: 0,
        projectCode: ws.projectCode,
        issueNumber,
        labels: payload.labels,
      };
      tasks.push(task);
      return task;
    }
    const row = await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskCreateToBackend(payload)),
    });
    return taskFromBackend(row);
  },

  async update(taskId, patch) {
    if (USE_MOCK) {
      await mockDelay(120);
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) throw new Error(`Task not found: ${taskId}`);
      const next = { ...tasks[idx], ...patch };
      if (patch.assigneeId && patch.assigneeId !== tasks[idx].assigneeId) {
        const assignee = await findAssignee(patch.assigneeId);
        if (assignee) next.assigneeName = assignee.name;
      }
      tasks[idx] = next;
      return next;
    }
    const row = await apiRequest(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskUpdateToBackend(patch)),
    });
    return taskFromBackend(row);
  },

  async updateStatus(taskId, status) {
    if (USE_MOCK) {
      await mockDelay(100);
      const idx = tasks.findIndex((t) => t.id === taskId);
      if (idx === -1) throw new Error(`Task not found: ${taskId}`);
      const prev = tasks[idx];
      const wasDone = prev.status === 'done';
      const isDone = status === 'done';
      tasks[idx] = { ...prev, status };
      const ws = findWorkspace(prev.workspaceId);
      if (ws) {
        if (!wasDone && isDone) ws.completedTasks += 1;
        else if (wasDone && !isDone) ws.completedTasks -= 1;
      }
      return tasks[idx];
    }
    const row = await apiRequest(`/tasks/${taskId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: statusToBackend(status) }),
    });
    return taskFromBackend(row);
  },
};

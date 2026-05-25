// Lightweight shared cache for tasks/users/workspaces. We hold a single source of
// truth so list views and the Kanban stay in sync when status changes. When a
// real backend lands, swap the loaders for SWR / TanStack Query without touching
// the pages.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { taskService } from '@/services/taskService';
import { teamService } from '@/services/teamService';
import { userService } from '@/services/userService';
import { workspaceService } from '@/services/workspaceService';

const DataContext = createContext(undefined);

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [t, u, w, tm] = await Promise.all([
        taskService.getAll(),
        userService.getAll(),
        workspaceService.getAll(),
        teamService.getAll(),
      ]);
      setTasks(t);
      setUsers(u);
      setWorkspaces(w);
      setTeams(tm);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo(
    () => ({
      tasks,
      users,
      workspaces,
      teams,
      loading,
      reload,
      async createTask(payload) {
        const t = await taskService.create(payload);
        setTasks((prev) => [...prev, t]);
        const ws = await workspaceService.getAll();
        setWorkspaces(ws);
        return t;
      },
      async createUser(payload) {
        const u = await userService.create(payload);
        setUsers((prev) => [...prev, u]);
        return u;
      },
      async deleteUser(userId) {
        await userService.delete(userId);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      },
      async resetUserPassword(userId, newPassword) {
        await userService.resetPassword(userId, newPassword);
      },
      async createWorkspace(payload) {
        const w = await workspaceService.create(payload);
        setWorkspaces((prev) => [...prev, w]);
        return w;
      },
      async deleteWorkspace(workspaceId) {
        await workspaceService.delete(workspaceId);
        setWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));
        // Drop any tasks that referenced the deleted workspace so the UI
        // doesn't show stale counts.
        setTasks((prev) => prev.filter((t) => t.workspaceId !== workspaceId));
      },
      async addWorkspaceMember(workspaceId, userId) {
        const w = await workspaceService.addMember(workspaceId, userId);
        setWorkspaces((prev) => prev.map((x) => (x.id === w.id ? w : x)));
        return w;
      },
      async removeWorkspaceMember(workspaceId, userId) {
        const w = await workspaceService.removeMember(workspaceId, userId);
        setWorkspaces((prev) => prev.map((x) => (x.id === w.id ? w : x)));
        return w;
      },
      async updateTask(taskId, patch) {
        // Optimistic update so inline-edit feels instant.
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
        );
        try {
          await taskService.update(taskId, patch);
        } catch (err) {
          // Roll back by reloading on failure.
          await reload();
          throw err;
        }
      },
      async deleteTask(taskId) {
        await taskService.delete(taskId);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        // Refresh workspaces so totalTasks / completedTasks counters track
        // the removal (avoids a stale 5/10 reading after deleting 1).
        try {
          const ws = await workspaceService.getAll();
          setWorkspaces(ws);
        } catch {
          // Non-critical: if refresh fails the next reload() will catch up.
        }
      },
      async updateTaskStatus(taskId, status) {
        // Optimistic update.
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
        );
        try {
          await taskService.updateStatus(taskId, status);
          const ws = await workspaceService.getAll();
          setWorkspaces(ws);
        } catch (err) {
          // Roll back by reloading on failure.
          await reload();
          throw err;
        }
      },
    }),
    [tasks, users, workspaces, teams, loading, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used inside <DataProvider>');
  return ctx;
};

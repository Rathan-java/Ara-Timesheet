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

  // Silent fetch — same as reload() but doesn't toggle loading state.
  // Used by background polling + focus refetch so a 30s tick doesn't flash a
  // spinner across the whole UI.
  const fetchAll = useCallback(async () => {
    const [t, u, w, tm] = await Promise.allSettled([
      taskService.getAll(),
      userService.getAll(),
      workspaceService.getAll(),
      teamService.getAll(),
    ]);
    if (t.status === 'fulfilled') setTasks(t.value);
    else console.warn('Failed to load tasks:', t.reason?.message);
    if (u.status === 'fulfilled') setUsers(u.value);
    else console.warn('Failed to load users:', u.reason?.message);
    if (w.status === 'fulfilled') setWorkspaces(w.value);
    else console.warn('Failed to load workspaces:', w.reason?.message);
    if (tm.status === 'fulfilled') setTeams(tm.value);
    else console.warn('Failed to load teams:', tm.reason?.message);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      await fetchAll();
    } finally {
      setLoading(false);
    }
  }, [fetchAll]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Near-real-time updates without WebSockets:
  // - Refetch when the tab regains focus (catches "manager assigned to me
  //   while I was on another tab" within the time it takes to click back).
  // - Background poll every 30s while the tab is visible, so even a user
  //   sitting on the same tab sees new tasks within at most 30 seconds.
  // Background refreshes go through fetchAll() (no loading spinner) so the
  // UI doesn't flash on every tick.
  useEffect(() => {
    const POLL_INTERVAL_MS = 30_000;
    const intervalId = setInterval(() => {
      if (
        typeof document !== 'undefined' &&
        document.visibilityState === 'visible'
      ) {
        void fetchAll();
      }
    }, POLL_INTERVAL_MS);

    const onFocus = () => {
      void fetchAll();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') void fetchAll();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchAll]);

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
        // The backend's POST /tasks returns the raw inserted row without the
        // JOINed assignee_name / workspace_name. Enrich from the local
        // caches so cards render the right avatar + workspace label
        // immediately instead of showing "?" / blank.
        const assignee = users.find((u) => String(u.id) === String(t.assigneeId));
        const ws = workspaces.find((w) => String(w.id) === String(t.workspaceId));
        const enriched = {
          ...t,
          assigneeName: t.assigneeName || assignee?.name || '',
          assigneeId: t.assigneeId ? String(t.assigneeId) : t.assigneeId,
          workspaceName: t.workspaceName || ws?.name || '',
          workspaceId: t.workspaceId ? String(t.workspaceId) : t.workspaceId,
        };
        setTasks((prev) => [...prev, enriched]);
        const wsList = await workspaceService.getAll();
        setWorkspaces(wsList);
        return enriched;
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

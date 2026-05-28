// Employee Board.
// Pick a workspace (only the ones I'm a member of). The board then shows
// every task in that workspace — mine and teammates' — using the
// workspace-membership bypass on GET /api/tasks. Toggle "Only my tasks"
// to drop back to just my own cards.

import { Filter, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { KanbanBoard } from '@/components/KanbanBoard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { taskService } from '@/services/taskService';

export const EmployeeBoardPage = () => {
  const { user } = useAuth();
  const { workspaces, updateTaskStatus } = useData();
  const navigate = useNavigate();

  // Only show workspaces the employee is actually a member of.
  // Coerce both sides to strings — memberIds can be numbers or strings
  // depending on backend version (mysql2 returns ints, our adapter coerces
  // to strings most of the time but not always under hydration paths).
  const myWorkspaces = useMemo(() => {
    if (!user?.id) return [];
    const uid = String(user.id);
    return workspaces.filter(
      (w) =>
        Array.isArray(w.memberIds) &&
        w.memberIds.some((mid) => String(mid) === uid),
    );
  }, [workspaces, user?.id]);

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [myTasksOnly, setMyTasksOnly] = useState(false);
  const [workspaceTasks, setWorkspaceTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  // Pick a default workspace once the list loads. Preserve selection across
  // re-renders if the previously-selected workspace is still in the list.
  useEffect(() => {
    if (myWorkspaces.length === 0) {
      setSelectedWorkspaceId(null);
      return;
    }
    if (
      selectedWorkspaceId == null ||
      !myWorkspaces.some((w) => w.id === selectedWorkspaceId)
    ) {
      setSelectedWorkspaceId(myWorkspaces[0].id);
    }
  }, [myWorkspaces, selectedWorkspaceId]);

  // Fetch tasks for the selected workspace. Uses GET /api/tasks?workspace_id=X
  // which (after the backend bypass change) returns every task in the
  // workspace for any member.
  const refetch = useCallback(async (wsId) => {
    if (!wsId) {
      setWorkspaceTasks([]);
      return;
    }
    setLoading(true);
    setFetchError(null);
    try {
      const rows = await taskService.getByWorkspace(wsId);
      setWorkspaceTasks(rows);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load tasks.');
      setWorkspaceTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch(selectedWorkspaceId);
  }, [selectedWorkspaceId, refetch]);

  // What the Kanban actually renders. The toggle further narrows to my own
  // tasks; off → whole team in the workspace.
  const visibleTasks = useMemo(() => {
    if (!myTasksOnly) return workspaceTasks;
    const uid = String(user?.id);
    return workspaceTasks.filter((t) => String(t.assigneeId) === uid);
  }, [workspaceTasks, myTasksOnly, user?.id]);

  // Drag-to-change-status: optimistic local update + persist + refetch so
  // counts stay in sync.
  const handleStatusChange = async (taskId, status) => {
    setWorkspaceTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t)),
    );
    try {
      await updateTaskStatus(taskId, status);
    } catch {
      // Roll back by refetching on failure.
      await refetch(selectedWorkspaceId);
    }
  };

  if (myWorkspaces.length === 0) {
    return (
      <AppLayout
        title="My Board"
        action={
          <button
            type="button"
            onClick={() => navigate('/employee/create-task')}
            className="btn-primary"
          >
            <Plus size={16} /> New Task
          </button>
        }
      >
        <div className="mx-auto max-w-2xl p-6">
          <div className="card-base p-6 text-center">
            <p className="text-base font-semibold text-ink">
              You're not in any workspace yet
            </p>
            <p className="mt-1 text-sm text-ink-secondary">
              Ask your team lead or management to add you to a workspace,
              then your board will populate here.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const selectedWorkspace = myWorkspaces.find(
    (w) => w.id === selectedWorkspaceId,
  );

  return (
    <AppLayout
      title="My Board"
      action={
        <button
          type="button"
          onClick={() => navigate('/employee/create-task')}
          className="btn-primary"
        >
          <Plus size={16} /> New Task
        </button>
      }
    >
      <div className="flex h-full flex-col">
        {/* Toolbar: workspace dropdown + filter toggle */}
        <div className="flex flex-wrap items-center gap-3 px-4 pt-4 lg:px-6">
          <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            Workspace:
            <select
              value={selectedWorkspaceId ?? ''}
              onChange={(e) => setSelectedWorkspaceId(e.target.value)}
              className="input-base !w-auto !py-1.5 text-xs"
            >
              {myWorkspaces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.projectCode})
                </option>
              ))}
            </select>
          </label>

          {selectedWorkspace && (
            <span className="text-[11px] text-ink-light">
              {workspaceTasks.length} task
              {workspaceTasks.length === 1 ? '' : 's'}
              {myTasksOnly && (
                <>
                  {' '}
                  · showing {visibleTasks.length} of mine
                </>
              )}
            </span>
          )}

          <label className="ml-auto inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-ink-secondary">
            <Filter size={12} />
            <input
              type="checkbox"
              checked={myTasksOnly}
              onChange={(e) => setMyTasksOnly(e.target.checked)}
              className="accent-primary"
            />
            My tasks only
          </label>
        </div>

        <p className="px-4 pt-2 text-xs text-ink-light lg:px-6">
          Drag tasks between columns to update their status.
        </p>

        {fetchError && (
          <p className="mx-4 mt-2 rounded-jira bg-error/10 px-3 py-2 text-sm text-error lg:mx-6">
            {fetchError}
          </p>
        )}

        <div className="min-h-0 flex-1">
          {loading ? (
            <div className="flex h-40 items-center justify-center text-sm text-ink-light">
              Loading…
            </div>
          ) : (
            <KanbanBoard
              tasks={visibleTasks}
              onTaskClick={(t) => navigate(`/employee/tasks/${t.id}`)}
              onStatusChange={handleStatusChange}
              onAdd={() => navigate('/employee/create-task')}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

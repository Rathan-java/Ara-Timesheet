// Workspace detail — members + tasks, scoped to the workspace.
//
// Access rules:
// - Employee can view only if they are a member.
// - Team Lead and Management can always view, AND can add / remove members.
//
// Adds / removes go through the DataContext so the workspace list and other
// pages stay in sync without a refetch.

import {
  ArrowLeft,
  Folder,
  Send,
  UserMinus,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { EmployeeCard } from '@/components/EmployeeCard.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { TaskCard } from '@/components/TaskCard.jsx';
import { iconByName } from '@/components/iconRegistry.js';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { workspaceCompletion } from '@/types';
import { withAlpha } from '@/utils/theme';
import { taskDetailPath, userDetailPath } from '@/utils/paths';

export const WorkspaceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const {
    workspaces,
    users,
    tasks,
    addWorkspaceMember,
    removeWorkspaceMember,
  } = useData();
  const navigate = useNavigate();
  const [addingId, setAddingId] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  // Find workspace by id — string compare (adapter coerces both sides).
  const workspace = workspaces.find((w) => String(w.id) === String(id));

  // IMPORTANT: every hook must run on every render. Previously these useMemo
  // calls came AFTER the `if (!workspace)` / `if (!canView)` early returns,
  // which caused "Rendered more hooks than during the previous render" and
  // crashed the component to a blank page when the workspaces list loaded
  // asynchronously. Compute them up-front with null-safe access; the
  // conditional returns can happen below.
  const memberIdSet = useMemo(
    () => new Set((workspace?.memberIds ?? []).map(String)),
    [workspace?.memberIds],
  );
  const members = useMemo(
    () =>
      users.filter(
        (u) => memberIdSet.has(String(u.id)) && u.role === 'employee',
      ),
    [users, memberIdSet],
  );
  const nonMembers = useMemo(
    () =>
      users.filter(
        (u) => u.role === 'employee' && !memberIdSet.has(String(u.id)),
      ),
    [users, memberIdSet],
  );
  const wsTasks = useMemo(
    () => tasks.filter((t) => String(t.workspaceId) === String(workspace?.id)),
    [tasks, workspace?.id],
  );

  if (!workspace) {
    return (
      <AppLayout title="Workspace not found">
        <div className="mx-auto max-w-2xl p-6 text-sm text-ink-secondary">
          We couldn’t find that workspace.
          <div className="mt-3">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Type-safe membership check: cached user IDs may be number or string.
  const isMember =
    user?.id != null &&
    workspace.memberIds.some((mid) => String(mid) === String(user.id));
  const canEdit = user?.role === 'management' || user?.role === 'teamLead';
  const canView = canEdit || isMember;

  if (!canView) {
    return (
      <AppLayout title={workspace.name}>
        <div className="mx-auto max-w-2xl p-6">
          <EmptyState
            title="No access to this workspace"
            description="You're not a member of this workspace. Ask your team lead or management to add you."
            action={
              <button
                onClick={() => navigate(-1)}
                className="btn-secondary mt-3"
              >
                <ArrowLeft size={16} /> Back
              </button>
            }
          />
        </div>
      </AppLayout>
    );
  }

  const Icon = iconByName(workspace.icon) ?? Folder;
  const pct = Math.round(workspaceCompletion(workspace) * 100);

  const handleAdd = async () => {
    if (!addingId) return;
    setError(null);
    setBusy(true);
    try {
      await addWorkspaceMember(workspace.id, addingId);
      setAddingId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member.');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (userId) => {
    setError(null);
    setBusy(true);
    try {
      await removeWorkspaceMember(workspace.id, userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout
      title={workspace.name}
      action={
        canEdit ? (
          <button
            onClick={() =>
              navigate(
                user?.role === 'management'
                  ? '/management/assign-task'
                  : '/team-lead/assign-task',
              )
            }
            className="btn-primary"
          >
            <Send size={16} /> Assign Task
          </button>
        ) : null
      }
    >
      <div className="mx-auto max-w-6xl p-4 lg:p-6">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Header */}
        <div
          className="card-base p-5"
          style={{ borderLeft: `3px solid ${workspace.color}` }}
        >
          <div className="flex items-start gap-4">
            <span
              className="inline-flex h-12 w-12 items-center justify-center rounded-jira-lg"
              style={{ backgroundColor: withAlpha(workspace.color, 0.15) }}
            >
              <Icon size={26} color={workspace.color} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-ink">{workspace.name}</h2>
                <span
                  className="rounded-[3px] px-1.5 py-0.5 text-[10px] font-bold"
                  style={{
                    backgroundColor: withAlpha(workspace.color, 0.15),
                    color: workspace.color,
                  }}
                >
                  {workspace.projectCode}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-ink-secondary">
                {workspace.description}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-secondary">Progress</span>
              <span
                className="font-semibold"
                style={{ color: workspace.color }}
              >
                {pct}% · {workspace.completedTasks}/{workspace.totalTasks}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: workspace.color,
                }}
              />
            </div>
          </div>
        </div>

        {/* Members */}
        <section className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-ink">
            Members ({members.length})
          </h3>

          {canEdit && (
            <div className="card-base mb-3 flex flex-wrap items-center gap-2 p-3">
              <span className="text-sm font-semibold text-ink-secondary">
                Add member:
              </span>
              <select
                className="input-base !w-auto !py-1.5 min-w-0 max-w-xs flex-1 text-xs"
                value={addingId}
                onChange={(e) => setAddingId(e.target.value)}
                disabled={busy || nonMembers.length === 0}
              >
                <option value="">
                  {nonMembers.length === 0
                    ? '— Everyone is already a member —'
                    : '— Pick an employee —'}
                </option>
                {nonMembers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} — {u.designation}
                  </option>
                ))}
              </select>
              <button
                type="button"
                disabled={!addingId || busy}
                onClick={handleAdd}
                className="btn-primary"
              >
                <UserPlus size={14} /> Add
              </button>
            </div>
          )}

          {error && (
            <p className="mb-3 rounded-jira bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          {members.length === 0 ? (
            <EmptyState
              title="No members yet"
              description={
                canEdit
                  ? 'Use the picker above to add the first member.'
                  : 'No employees are assigned to this workspace.'
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {members.map((m) => {
                const memberPath = userDetailPath(user?.role, m.id);
                return (
                  <div key={m.id} className="relative">
                    <EmployeeCard
                      user={m}
                      tasks={wsTasks.filter((t) => t.assigneeId === m.id)}
                      onClick={memberPath ? () => navigate(memberPath) : undefined}
                    />
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleRemove(m.id)}
                        disabled={busy}
                        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-jira border border-divider bg-card text-ink-light transition hover:bg-error/10 hover:text-error"
                        title={`Remove ${m.name}`}
                        aria-label={`Remove ${m.name}`}
                      >
                        <UserMinus size={13} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Tasks */}
        <section className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-ink">
            Tasks ({wsTasks.length})
          </h3>
          {wsTasks.length === 0 ? (
            <EmptyState
              title="No tasks in this workspace yet"
              description={
                canEdit
                  ? 'Use Assign Task to create the first one.'
                  : 'You’ll see tasks here as soon as they’re assigned.'
              }
            />
          ) : (
            <div className="space-y-2">
              {wsTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  showWorkspace={false}
                  onClick={() => navigate(taskDetailPath(user?.role, t.id))}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

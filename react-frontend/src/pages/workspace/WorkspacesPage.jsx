// Shared workspace list for all three roles.
// - Employee: sees only the workspaces they're a member of.
// - Team Lead + Management: see every workspace.
// - Only Management can create new workspaces.

import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { TaskCard } from '@/components/TaskCard.jsx';
import { WorkspaceCard } from '@/components/WorkspaceCard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { taskDetailPath, userDetailPath, workspaceDetailPath } from '@/utils/paths';

export const WorkspacesPage = () => {
  const { user } = useAuth();
  const {
    workspaces,
    tasks,
    users,
    addWorkspaceMember,
    removeWorkspaceMember,
    deleteWorkspace,
  } = useData();
  const navigate = useNavigate();
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const canDelete = user?.role === 'management';

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteWorkspace(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete workspace.');
    } finally {
      setBusy(false);
    }
  };

  // Resolve memberIds → User objects once for the whole page.
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const membersFor = (workspace) =>
    workspace.memberIds.map((id) => userById.get(id)).filter(Boolean);
  const nonMembersFor = (workspace) =>
    users.filter(
      (u) => u.role === 'employee' && !workspace.memberIds.includes(u.id),
    );

  // Only Mgmt + TL can navigate to per-employee progress or edit members.
  const canEdit = user?.role === 'management' || user?.role === 'teamLead';
  const memberClickHandler = canEdit
    ? (uid) => navigate(userDetailPath(user.role, uid))
    : undefined;

  const visible = useMemo(() => {
    if (user?.role === 'employee') {
      return workspaces.filter((w) => w.memberIds.includes(user.id));
    }
    return workspaces;
  }, [workspaces, user]);

  return (
    <AppLayout
      title="Workspaces"
      action={
        user?.role === 'management' ? (
          <button
            onClick={() => navigate('/management/create-workspace')}
            className="btn-primary"
          >
            <Plus size={16} /> New Workspace
          </button>
        ) : null
      }
    >
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        {visible.length === 0 ? (
          <EmptyState
            title="No workspaces"
            description={
              user?.role === 'employee'
                ? "You're not a member of any workspace yet. Ask your team lead or management to add you."
                : 'Create a new workspace to get started.'
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {visible.map((w) => {
              const wsTasks = tasks.filter((t) => t.workspaceId === w.id);
              const recent = [...wsTasks]
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime(),
                )
                .slice(0, 3);
              return (
                <div key={w.id} className="space-y-3">
                  <WorkspaceCard
                    workspace={w}
                    members={membersFor(w)}
                    onMemberClick={memberClickHandler}
                    canEditMembers={canEdit}
                    nonMembers={canEdit ? nonMembersFor(w) : []}
                    onAddMember={
                      canEdit ? (uid) => addWorkspaceMember(w.id, uid) : undefined
                    }
                    onRemoveMember={
                      canEdit
                        ? (uid) => removeWorkspaceMember(w.id, uid)
                        : undefined
                    }
                    onDelete={canDelete ? () => setDeleteTarget(w) : undefined}
                    onClick={() => navigate(workspaceDetailPath(user?.role, w.id))}
                  />
                  <div className="card-base p-4">
                    <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-secondary">
                      Recent tasks
                    </h4>
                    {recent.length === 0 ? (
                      <p className="text-xs text-ink-light">No tasks yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {recent.map((t) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            showWorkspace={false}
                            onClick={() =>
                              navigate(taskDetailPath(user?.role, t.id))
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete workspace?"
        itemLabel={
          deleteTarget
            ? `${deleteTarget.name} (${deleteTarget.projectCode})`
            : ''
        }
        busy={busy}
        error={error}
        onCancel={() => {
          if (!busy) {
            setDeleteTarget(null);
            setError(null);
          }
        }}
        onConfirm={handleDelete}
      />
    </AppLayout>
  );
};

import { Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { ConfirmDeleteDialog } from '@/components/ConfirmDeleteDialog.jsx';
import { EmployeeCard } from '@/components/EmployeeCard.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { ResetPasswordDialog } from '@/components/ResetPasswordDialog.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { userDetailPath } from '@/utils/paths';

const TEAM_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'team1', label: 'Team 1' },
  { id: 'team2', label: 'Team 2' },
];

export const AllEmployeesPage = () => {
  const { user } = useAuth();
  const { users, tasks, deleteUser, resetUserPassword } = useData();
  const navigate = useNavigate();
  const [teamFilter, setTeamFilter] = useState('all');
  const [query, setQuery] = useState('');

  // Per-action dialog state. Holds the target user while the dialog is open.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const canManage = user?.role === 'management';

  const employees = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== 'employee') return false;
      if (teamFilter !== 'all' && u.teamId !== teamFilter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.designation.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [users, teamFilter, query]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setBusy(true);
    setError(null);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete user.');
    } finally {
      setBusy(false);
    }
  };

  const handleResetPassword = async (newPassword) => {
    if (!resetTarget) return;
    setBusy(true);
    setError(null);
    try {
      await resetUserPassword(resetTarget.id, newPassword);
      setResetTarget(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset password.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppLayout
      title="Employees"
      action={
        <button
          onClick={() => navigate('/management/create-employee')}
          className="btn-primary"
        >
          <UserPlus size={16} /> New Employee
        </button>
      }
    >
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light"
            />
            <input
              className="input-base pl-9"
              placeholder="Search by name, email, designation…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {TEAM_FILTERS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTeamFilter(t.id)}
                className={`rounded-jira px-3 py-1.5 text-xs font-semibold transition ${
                  teamFilter === t.id
                    ? 'bg-primary text-white'
                    : 'bg-card border border-divider text-ink-secondary hover:bg-surface'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {employees.length === 0 ? (
            <div className="sm:col-span-2 lg:col-span-3">
              <EmptyState
                title="No employees match"
                description="Try a different filter, or add a new employee."
              />
            </div>
          ) : (
            employees.map((u) => (
              <EmployeeCard
                key={u.id}
                user={u}
                tasks={tasks.filter((t) => t.assigneeId === u.id)}
                onClick={() => navigate(userDetailPath(user?.role, u.id))}
                onDelete={canManage ? () => setDeleteTarget(u) : undefined}
                onResetPassword={
                  canManage ? () => setResetTarget(u) : undefined
                }
              />
            ))
          )}
        </div>
      </div>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        title="Delete employee?"
        itemLabel={deleteTarget?.name ?? ''}
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

      <ResetPasswordDialog
        open={Boolean(resetTarget)}
        userLabel={resetTarget?.name ?? ''}
        busy={busy}
        error={error}
        onCancel={() => {
          if (!busy) {
            setResetTarget(null);
            setError(null);
          }
        }}
        onConfirm={handleResetPassword}
      />
    </AppLayout>
  );
};

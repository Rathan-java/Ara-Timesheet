import { Search, UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { EmployeeCard } from '@/components/EmployeeCard.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
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
  const { users, tasks } = useData();
  const navigate = useNavigate();
  const [teamFilter, setTeamFilter] = useState('all');
  const [query, setQuery] = useState('');

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
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

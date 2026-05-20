import {
  Briefcase,
  CalendarDays,
  LogOut,
  Mail,
  ShieldCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { Avatar } from '@/components/Avatar.jsx';
import { EmployeeCard } from '@/components/EmployeeCard.jsx';
import { WorkspaceCard } from '@/components/WorkspaceCard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { roleDisplayName } from '@/types';
import { formatLongDate } from '@/utils/date';
import { userDetailPath, workspaceDetailPath } from '@/utils/paths';

const tabsForRole = (role) => {
  switch (role) {
    case 'employee':
      return ['profile'];
    case 'teamLead':
      return ['profile', 'team', 'workspaces'];
    case 'management':
      return ['profile', 'employees'];
    default:
      return ['profile'];
  }
};

const tabLabel = (t) => {
  switch (t) {
    case 'profile':
      return 'My Profile';
    case 'team':
      return 'Team';
    case 'workspaces':
      return 'Workspaces';
    case 'employees':
      return 'Employees';
    default:
      return t;
  }
};

export const ProfilePage = ({ role }) => {
  const { user, logout } = useAuth();
  const { users, workspaces, tasks } = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');

  if (!user) return null;
  const tabs = tabsForRole(role);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const teamMembers =
    user.role === 'teamLead' && user.teamId
      ? users.filter((u) => u.teamId === user.teamId && u.id !== user.id)
      : [];

  const employees = users.filter((u) => u.role === 'employee');

  return (
    <AppLayout title="Profile">
      <div className="mx-auto max-w-5xl p-4 lg:p-6">
        {tabs.length > 1 && (
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-jira px-3 py-1.5 text-sm font-semibold capitalize transition ${
                  tab === t
                    ? 'bg-primary text-white'
                    : 'bg-card border border-divider text-ink-secondary hover:bg-surface'
                }`}
              >
                {tabLabel(t)}
              </button>
            ))}
          </div>
        )}

        {tab === 'profile' && (
          <div className="card-base p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <Avatar name={user.name} url={user.avatarUrl} size={84} />
              <h2 className="text-xl font-bold text-ink">{user.name}</h2>
              <p className="text-sm text-ink-secondary">{user.designation}</p>
            </div>

            <div className="mt-6 space-y-2">
              <DetailRow
                icon={<Mail size={16} />}
                label="Email"
                value={user.email}
              />
              <DetailRow
                icon={<ShieldCheck size={16} />}
                label="Role"
                value={roleDisplayName(user.role)}
              />
              {user.teamId && (
                <DetailRow
                  icon={<UsersIcon size={16} />}
                  label="Team"
                  value={user.teamId}
                />
              )}
              <DetailRow
                icon={<CalendarDays size={16} />}
                label="Joined"
                value={formatLongDate(user.joinedDate)}
              />
              <DetailRow
                icon={<Briefcase size={16} />}
                label="Designation"
                value={user.designation}
              />
            </div>

            <button onClick={handleLogout} className="btn-danger mt-6 w-full">
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}

        {tab === 'team' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {teamMembers.length === 0 && (
              <p className="text-sm text-ink-light">No team members.</p>
            )}
            {teamMembers.map((m) => {
              const path = userDetailPath(user.role, m.id);
              return (
                <EmployeeCard
                  key={m.id}
                  user={m}
                  tasks={tasks.filter((t) => t.assigneeId === m.id)}
                  onClick={path ? () => navigate(path) : undefined}
                />
              );
            })}
          </div>
        )}

        {tab === 'workspaces' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {workspaces.map((w) => (
              <WorkspaceCard
                key={w.id}
                workspace={w}
                onClick={() => navigate(workspaceDetailPath(user.role, w.id))}
              />
            ))}
          </div>
        )}

        {tab === 'employees' && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {employees.map((e) => {
              const path = userDetailPath(user.role, e.id);
              return (
                <EmployeeCard
                  key={e.id}
                  user={e}
                  tasks={tasks.filter((t) => t.assigneeId === e.id)}
                  onClick={path ? () => navigate(path) : undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

const DetailRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-jira border border-divider bg-card p-3">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-jira bg-primary/10 text-primary">
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-[11px] uppercase text-ink-light">{label}</p>
      <p className="truncate text-sm font-medium text-ink">{value}</p>
    </div>
  </div>
);

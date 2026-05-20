import {
  Bell,
  Briefcase,
  Building2,
  ClipboardList,
  KanbanSquare,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Plus,
  Send,
  User as UserIcon,
  UserPlus,
  Users as UsersIcon,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';
import { roleDisplayName } from '@/types';
import { Avatar } from './Avatar.jsx';

const EMPLOYEE_NAV = [
  { to: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/employee/board', label: 'Board', icon: KanbanSquare },
  { to: '/employee/tasks', label: 'My Tasks', icon: ClipboardList },
  { to: '/employee/workspaces', label: 'Workspaces', icon: Building2 },
  { to: '/employee/create-task', label: 'New Task', icon: Plus },
];

const TEAMLEAD_NAV = [
  { to: '/team-lead/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/team-lead/team-tasks', label: 'Team Tasks', icon: KanbanSquare },
  { to: '/team-lead/workspaces', label: 'Workspaces', icon: Building2 },
  { to: '/team-lead/assign-task', label: 'Assign Task', icon: Send },
];

const MGMT_NAV = [
  { to: '/management/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/management/employees', label: 'Employees', icon: UsersIcon },
  { to: '/management/workspaces', label: 'Workspaces', icon: Building2 },
  { to: '/management/tasks', label: 'All Tasks', icon: ListChecks },
  { to: '/management/assign-task', label: 'Assign Task', icon: Send },
  { to: '/management/create-employee', label: 'New Employee', icon: UserPlus },
  { to: '/management/create-workspace', label: 'New Workspace', icon: Plus },
];

const navForRole = (role) => {
  switch (role) {
    case 'employee':
      return EMPLOYEE_NAV;
    case 'teamLead':
      return TEAMLEAD_NAV;
    case 'management':
      return MGMT_NAV;
    default:
      return [];
  }
};

const profilePathFor = (role) => {
  switch (role) {
    case 'employee':
      return '/employee/profile';
    case 'teamLead':
      return '/team-lead/profile';
    case 'management':
      return '/management/profile';
    default:
      return '/login';
  }
};

export const AppLayout = ({ children, title, action }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Close mobile sidebar on route change.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (!user) return null;
  const items = navForRole(user.role);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-60 transform flex-col bg-navy text-white transition-transform lg:relative lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-4">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-jira bg-primary">
            <Briefcase size={18} />
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Ara Timesheet
          </span>
          <button
            type="button"
            className="ml-auto lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-3 py-2">
          <div className="rounded-jira-lg bg-navy-light/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-white/50">
              Logged in as
            </p>
            <p className="mt-0.5 truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-[11px] text-white/60">
              {roleDisplayName(user.role)}
            </p>
          </div>
        </div>

        <nav className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-jira px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-white/75 hover:bg-navy-light hover:text-white'
                    }`
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              </li>
            ))}

            <li className="mt-4">
              <NavLink
                to={profilePathFor(user.role)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-jira px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-white/75 hover:bg-navy-light hover:text-white'
                  }`
                }
              >
                <UserIcon size={16} />
                Profile
              </NavLink>
            </li>
          </ul>
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="m-3 flex items-center justify-center gap-2 rounded-jira border border-white/20 px-3 py-2 text-sm font-medium text-white/80 hover:bg-navy-light hover:text-white"
        >
          <LogOut size={16} /> Logout
        </button>
      </aside>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="flex items-center gap-3 border-b border-divider bg-card px-4 py-3 lg:px-6">
          <button
            type="button"
            className="rounded-jira p-2 hover:bg-surface lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <h1 className="truncate text-lg font-semibold text-ink">
              {title ?? 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {action}
            <button
              type="button"
              className="relative rounded-jira p-2 text-ink-secondary hover:bg-surface"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 inline-block h-2 w-2 rounded-full bg-error" />
            </button>
            <Avatar name={user.name} url={user.avatarUrl} size={32} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

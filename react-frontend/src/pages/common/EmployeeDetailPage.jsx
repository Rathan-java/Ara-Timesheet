// Per-employee progress page used by Management and Team Lead.
// Shows the person's profile, status stat cards, completion bar, the workspaces
// they're a member of, and a full filterable task list.

import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Eye,
  Mail,
  ShieldCheck,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { Avatar } from '@/components/Avatar.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { StatCard } from '@/components/StatCard.jsx';
import { TaskCard } from '@/components/TaskCard.jsx';
import { TaskStatusPieChart } from '@/components/TaskChart.jsx';
import { WorkspaceCard } from '@/components/WorkspaceCard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { isOverdue, roleDisplayName } from '@/types';
import { colors } from '@/utils/theme';
import { formatLongDate } from '@/utils/date';
import { taskDetailPath, workspaceDetailPath } from '@/utils/paths';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To Do' },
  { id: 'inProgress', label: 'In Progress' },
  { id: 'review', label: 'In Review' },
  { id: 'done', label: 'Done' },
  { id: 'overdue', label: 'Overdue' },
];

const matchesFilter = (task, filter) => {
  if (filter === 'all') return true;
  if (filter === 'overdue') return isOverdue(task);
  return task.status === filter;
};

export const EmployeeDetailPage = () => {
  const { id } = useParams();
  const { user: viewer } = useAuth();
  const { users, workspaces, tasks } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const subject = users.find((u) => u.id === id);

  if (!subject) {
    return (
      <AppLayout title="Employee not found">
        <div className="mx-auto max-w-2xl p-6 text-sm text-ink-secondary">
          We couldn’t find that employee.
          <div className="mt-3">
            <button onClick={() => navigate(-1)} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Team Leads can only inspect their own team members. Management sees all.
  const canView =
    viewer?.role === 'management' ||
    (viewer?.role === 'teamLead' && subject.teamId === viewer.teamId) ||
    viewer?.id === subject.id;

  if (!canView) {
    return (
      <AppLayout title={subject.name}>
        <div className="mx-auto max-w-2xl p-6">
          <EmptyState
            title="No access"
            description="You can only view employees on your own team."
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

  const userTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === subject.id),
    [tasks, subject.id],
  );
  const counts = useMemo(
    () => ({
      total: userTasks.length,
      todo: userTasks.filter((t) => t.status === 'todo').length,
      inProgress: userTasks.filter((t) => t.status === 'inProgress').length,
      review: userTasks.filter((t) => t.status === 'review').length,
      done: userTasks.filter((t) => t.status === 'done').length,
      overdue: userTasks.filter((t) => isOverdue(t)).length,
    }),
    [userTasks],
  );
  const completionPct =
    counts.total > 0 ? Math.round((counts.done / counts.total) * 100) : 0;

  // Type-safe compare — same pattern as WorkspacesPage. Without this a
  // numeric memberIds entry from one backend variant won't match a string
  // subject.id, and the user appears to be in zero workspaces.
  const userWorkspaces = useMemo(() => {
    const uid = String(subject.id);
    return workspaces.filter(
      (w) =>
        Array.isArray(w.memberIds) &&
        w.memberIds.some((mid) => String(mid) === uid),
    );
  }, [workspaces, subject.id]);

  const filteredTasks = useMemo(
    () => userTasks.filter((t) => matchesFilter(t, filter)),
    [userTasks, filter],
  );

  return (
    <AppLayout title={subject.name}>
      <div className="mx-auto max-w-6xl p-4 lg:p-6">
        <button onClick={() => navigate(-1)} className="btn-secondary mb-4">
          <ArrowLeft size={16} /> Back
        </button>

        {/* Profile header */}
        <div className="card-base p-5">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <Avatar name={subject.name} url={subject.avatarUrl} size={64} />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-ink">{subject.name}</h2>
              <p className="text-sm text-ink-secondary">{subject.designation}</p>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-ink-light">
                <span className="inline-flex items-center gap-1">
                  <Mail size={12} /> {subject.email}
                </span>
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck size={12} /> {roleDisplayName(subject.role)}
                </span>
                {subject.teamId && (
                  <span className="inline-flex items-center gap-1">
                    <UsersIcon size={12} /> {subject.teamId}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <CalendarDays size={12} /> Joined{' '}
                  {formatLongDate(subject.joinedDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Briefcase size={12} /> {userWorkspaces.length} workspaces
                </span>
              </div>
            </div>
          </div>

          {/* Completion bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-ink-secondary">
                Overall completion
              </span>
              <span className="font-semibold text-done">
                {completionPct}% · {counts.done}/{counts.total}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-done transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status stats */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            title="To Do"
            value={counts.todo}
            icon={ClipboardList}
            color={colors.todoGray}
          />
          <StatCard
            title="In Progress"
            value={counts.inProgress}
            icon={TrendingUp}
            color={colors.progressBlue}
          />
          <StatCard
            title="In Review"
            value={counts.review}
            icon={Eye}
            color={colors.reviewPurple}
          />
          <StatCard
            title="Completed"
            value={counts.done}
            icon={CheckCircle2}
            color={colors.doneGreen}
          />
        </div>

        {/* Distribution chart */}
        {counts.total > 0 && (
          <div className="card-base mt-4 p-5">
            <h3 className="mb-3 text-base font-semibold text-ink">
              Task Distribution
            </h3>
            <div className="h-56">
              <TaskStatusPieChart tasks={userTasks} />
            </div>
          </div>
        )}

        {/* Workspaces */}
        <section className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-ink">
            Workspaces ({userWorkspaces.length})
          </h3>
          {userWorkspaces.length === 0 ? (
            <EmptyState
              title="Not in any workspaces yet"
              description="Add them to a workspace from the workspace page."
            />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {userWorkspaces.map((w) => (
                <WorkspaceCard
                  key={w.id}
                  workspace={w}
                  onClick={() => navigate(workspaceDetailPath(viewer?.role, w.id))}
                />
              ))}
            </div>
          )}
        </section>

        {/* Tasks */}
        <section className="mt-6">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-ink">
              Tasks ({filteredTasks.length} of {counts.total})
            </h3>
            <div className="ml-auto flex flex-wrap gap-1">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={`rounded-jira px-3 py-1 text-xs font-semibold transition ${
                    filter === f.id
                      ? 'bg-primary text-white'
                      : 'bg-card text-ink-secondary border border-divider hover:bg-surface'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <EmptyState
              title="No tasks match"
              description="Try a different filter."
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  showAssignee={false}
                  onClick={() => navigate(taskDetailPath(viewer?.role, t.id))}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

import { Filter, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { MiniStatCard } from '@/components/StatCard.jsx';
import { TaskCard } from '@/components/TaskCard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { colors } from '@/utils/theme';

export const EmployeeTaskListPage = () => {
  const { user } = useAuth();
  const { tasks } = useData();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === user?.id),
    [tasks, user?.id],
  );

  const counts = useMemo(
    () => ({
      todo: myTasks.filter((t) => t.status === 'todo').length,
      inProgress: myTasks.filter((t) => t.status === 'inProgress').length,
      review: myTasks.filter((t) => t.status === 'review').length,
      done: myTasks.filter((t) => t.status === 'done').length,
    }),
    [myTasks],
  );

  const filtered = useMemo(() => {
    return myTasks.filter((t) => {
      if (filter !== 'all' && t.status !== filter) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          `${t.projectCode}-${t.issueNumber}`.toLowerCase().includes(q) ||
          t.workspaceName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [myTasks, filter, query]);

  return (
    <AppLayout
      title="My Tasks"
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
      <div className="mx-auto max-w-5xl p-4 lg:p-6">
        <div className="flex flex-wrap gap-2">
          <MiniStatCard title="To Do" value={counts.todo} color={colors.todoGray} />
          <MiniStatCard
            title="In Progress"
            value={counts.inProgress}
            color={colors.progressBlue}
          />
          <MiniStatCard
            title="In Review"
            value={counts.review}
            color={colors.reviewPurple}
          />
          <MiniStatCard
            title="Done"
            value={counts.done}
            color={colors.doneGreen}
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, key, workspace…"
              className="input-base pl-9"
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-ink-secondary">
            <Filter size={14} /> Filter:
          </div>
          <FilterChip
            label="All"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterChip
            label="To Do"
            active={filter === 'todo'}
            onClick={() => setFilter('todo')}
          />
          <FilterChip
            label="In Progress"
            active={filter === 'inProgress'}
            onClick={() => setFilter('inProgress')}
          />
          <FilterChip
            label="In Review"
            active={filter === 'review'}
            onClick={() => setFilter('review')}
          />
          <FilterChip
            label="Done"
            active={filter === 'done'}
            onClick={() => setFilter('done')}
          />
        </div>

        <div className="mt-4 space-y-2">
          {filtered.length === 0 ? (
            <EmptyState
              title="No tasks match your filters"
              description="Try clearing your filters or creating a new task."
            />
          ) : (
            filtered.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                showAssignee={false}
                onClick={() => navigate(`/employee/tasks/${t.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
};

const FilterChip = ({ label, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`rounded-jira px-3 py-1 text-xs font-semibold transition ${
      active
        ? 'bg-primary text-white'
        : 'bg-card text-ink-secondary border border-divider hover:bg-surface'
    }`}
  >
    {label}
  </button>
);

import { Download, Filter, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { EmptyState } from '@/components/EmptyState.jsx';
import { ExportTasksDialog } from '@/components/ExportTasksDialog.jsx';
import { MiniStatCard } from '@/components/StatCard.jsx';
import { TaskCard } from '@/components/TaskCard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { FEATURE_EXPORT } from '@/services/config';
import { exportService } from '@/services/exportService';
import { isOverdue } from '@/types';
import { colors } from '@/utils/theme';
import { taskDetailPath } from '@/utils/paths';

// Filter chips. "overdue" isn't a status — it's a derived condition (any
// non-done task past its deadline).
const FILTERS = [
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

export const ManagementTasksPage = () => {
  const { user } = useAuth();
  const { tasks, workspaces } = useData();
  const navigate = useNavigate();
  // Initial filter / workspace come from the query string so dashboard cards
  // can deep-link straight into a slice of the data.
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') ?? 'all';
  const initialWorkspace = searchParams.get('workspace') ?? 'all';

  const [filter, setFilter] = useState(initialFilter);
  const [workspaceId, setWorkspaceId] = useState(initialWorkspace);
  const [query, setQuery] = useState('');
  const [exportOpen, setExportOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  // Two-step export: open the date-range dialog, then call the backend with
  // the chosen window. Empty from/to means unbounded on that side — same
  // contract as /api/export/tasks.xlsx.
  const handleExportConfirm = async ({ from, to }) => {
    setExporting(true);
    setExportError(null);
    try {
      await exportService.downloadAllTasks({ from, to });
      setExportOpen(false);
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  const counts = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'inProgress').length,
      review: tasks.filter((t) => t.status === 'review').length,
      done: tasks.filter((t) => t.status === 'done').length,
      overdue: tasks.filter((t) => isOverdue(t)).length,
    }),
    [tasks],
  );

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (!matchesFilter(t, filter)) return false;
      if (workspaceId !== 'all' && t.workspaceId !== workspaceId) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.assigneeName.toLowerCase().includes(q) ||
          t.workspaceName.toLowerCase().includes(q) ||
          `${t.projectCode}-${t.issueNumber}`.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tasks, filter, workspaceId, query]);

  // Keep URL in sync so refreshes and shares preserve state.
  const updateFilter = (next) => {
    setFilter(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('filter');
    else params.set('filter', next);
    setSearchParams(params, { replace: true });
  };

  const updateWorkspace = (next) => {
    setWorkspaceId(next);
    const params = new URLSearchParams(searchParams);
    if (next === 'all') params.delete('workspace');
    else params.set('workspace', next);
    setSearchParams(params, { replace: true });
  };

  return (
    <AppLayout
      title="All Tasks"
      action={
        FEATURE_EXPORT ? (
          <button
            type="button"
            onClick={() => {
              setExportError(null);
              setExportOpen(true);
            }}
            className="btn-secondary"
            title="Download tasks as Excel for a date range"
          >
            <Download size={16} /> Export to Excel
          </button>
        ) : null
      }
    >
      <div className="mx-auto max-w-6xl p-4 lg:p-6">
        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          <MiniStatCard title="Total" value={counts.total} color={colors.primary} />
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
          <MiniStatCard title="Done" value={counts.done} color={colors.doneGreen} />
          <MiniStatCard
            title="Overdue"
            value={counts.overdue}
            color={colors.error}
          />
        </div>

        {/* Controls */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative max-w-xs flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-light"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, assignee, workspace, key…"
              className="input-base pl-9"
            />
          </div>

          <select
            value={workspaceId}
            onChange={(e) => updateWorkspace(e.target.value)}
            className="input-base !w-auto !py-1.5 text-xs"
          >
            <option value="all">All workspaces</option>
            {workspaces.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.projectCode})
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 text-xs text-ink-secondary">
            <Filter size={14} /> Filter:
          </div>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => updateFilter(f.id)}
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

        {/* Result count */}
        <p className="mt-4 text-xs text-ink-light">
          Showing {filtered.length} of {counts.total} tasks
        </p>

        {/* Task list — compact 3-column grid (was a single-column stack).
            Cards shrink to fit and the page no longer scrolls forever once
            the workspace has many tasks. */}
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length === 0 ? (
            <EmptyState
              title="No tasks match"
              description="Try clearing the filter, picking a different workspace, or changing the search."
            />
          ) : (
            filtered.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={() => navigate(taskDetailPath(user?.role, t.id))}
              />
            ))
          )}
        </div>
      </div>

      <ExportTasksDialog
        open={exportOpen}
        busy={exporting}
        error={exportError}
        onCancel={() => {
          if (!exporting) {
            setExportOpen(false);
            setExportError(null);
          }
        }}
        onConfirm={handleExportConfirm}
      />
    </AppLayout>
  );
};

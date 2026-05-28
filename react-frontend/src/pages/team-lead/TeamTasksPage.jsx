import { Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { KanbanBoard } from '@/components/KanbanBoard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { isInSprintWindow } from '@/types';
import { taskDetailPath } from '@/utils/paths';

export const TeamTasksPage = () => {
  const { user } = useAuth();
  const { users, tasks, updateTaskStatus } = useData();
  const navigate = useNavigate();
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  const teamMembers = useMemo(
    () => users.filter((u) => u.role === 'employee' && u.teamId === user?.teamId),
    [users, user?.teamId],
  );

  const teamTasks = useMemo(() => {
    const memberIds = new Set(teamMembers.map((m) => m.id));
    // Sprint window: Done tasks drop off the board 14 days after completion
    // (still available via All Tasks + Excel export).
    let list = tasks
      .filter((t) => memberIds.has(t.assigneeId))
      .filter(isInSprintWindow);
    if (assigneeFilter !== 'all') {
      list = list.filter((t) => t.assigneeId === assigneeFilter);
    }
    return list;
  }, [tasks, teamMembers, assigneeFilter]);

  return (
    <AppLayout
      title="Team Tasks"
      action={
        <button
          type="button"
          onClick={() => navigate('/team-lead/assign-task')}
          className="btn-primary"
        >
          <Plus size={16} /> Assign
        </button>
      }
    >
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 px-4 pt-4 lg:px-6">
          <label className="text-xs font-semibold text-ink-secondary">
            Assignee:
          </label>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="input-base !w-auto !py-1.5 text-xs"
          >
            <option value="all">All ({teamMembers.length})</option>
            {teamMembers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="min-h-0 flex-1">
          <KanbanBoard
            tasks={teamTasks}
            onTaskClick={(t) => navigate(taskDetailPath(user?.role, t.id))}
            onStatusChange={(id, status) => updateTaskStatus(id, status)}
            onAdd={() => navigate('/team-lead/assign-task')}
          />
        </div>
      </div>
    </AppLayout>
  );
};

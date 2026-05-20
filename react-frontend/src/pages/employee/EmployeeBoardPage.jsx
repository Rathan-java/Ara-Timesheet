import { Plus } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { KanbanBoard } from '@/components/KanbanBoard.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';

export const EmployeeBoardPage = () => {
  const { user } = useAuth();
  const { tasks, updateTaskStatus } = useData();
  const navigate = useNavigate();

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assigneeId === user?.id),
    [tasks, user?.id],
  );

  return (
    <AppLayout
      title="My Board"
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
      <div className="flex h-full flex-col">
        <div className="px-4 pt-4 lg:px-6">
          <p className="text-xs text-ink-secondary">
            Drag tasks between columns to update their status.
          </p>
        </div>
        <div className="min-h-0 flex-1">
          <KanbanBoard
            tasks={myTasks}
            onTaskClick={(t) => navigate(`/employee/tasks/${t.id}`)}
            onStatusChange={(id, status) => updateTaskStatus(id, status)}
            onAdd={() => navigate('/employee/create-task')}
          />
        </div>
      </div>
    </AppLayout>
  );
};

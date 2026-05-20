import { CheckCircle2, ClipboardList, Eye, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { MiniKanbanBoard } from '@/components/KanbanBoard.jsx';
import { StatCard } from '@/components/StatCard.jsx';
import { TaskCard } from '@/components/TaskCard.jsx';
import { TaskStatusPieChart } from '@/components/TaskChart.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { colors } from '@/utils/theme';

export const EmployeeDashboard = () => {
  const { user } = useAuth();
  const { tasks } = useData();
  const navigate = useNavigate();

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

  if (!user) return null;

  return (
    <AppLayout title="Dashboard">
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        {/* Greeting */}
        <div className="mb-6">
          <p className="text-sm text-ink-secondary">Welcome back,</p>
          <h2 className="text-2xl font-bold text-ink">{user.name}</h2>
        </div>

        {/* Stat grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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

        {/* Board overview */}
        <section className="mt-8">
          <h3 className="mb-3 text-base font-semibold text-ink">Board Overview</h3>
          <MiniKanbanBoard
            tasks={myTasks}
            onTaskClick={(t) => navigate(`/employee/tasks/${t.id}`)}
          />
        </section>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Distribution */}
          <div className="card-base p-5">
            <h3 className="mb-3 text-base font-semibold text-ink">
              Task Distribution
            </h3>
            <div className="h-56">
              <TaskStatusPieChart tasks={myTasks} />
            </div>
          </div>

          {/* Recent tasks */}
          <div className="card-base p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-semibold text-ink">Recent Tasks</h3>
              <Link
                to="/employee/tasks"
                className="text-xs font-semibold text-primary hover:underline"
              >
                See all
              </Link>
            </div>
            <div className="space-y-2">
              {myTasks.slice(0, 3).map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  showAssignee={false}
                  onClick={() => navigate(`/employee/tasks/${t.id}`)}
                />
              ))}
              {myTasks.length === 0 && (
                <p className="text-sm text-ink-light">
                  No tasks assigned yet — enjoy the calm.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

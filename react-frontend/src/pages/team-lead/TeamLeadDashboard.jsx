import {
  CheckCircle2,
  ClipboardList,
  Send,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { EmployeeCard } from '@/components/EmployeeCard.jsx';
import { StatCard } from '@/components/StatCard.jsx';
import { TaskStatusPieChart, WeeklyBarChart } from '@/components/TaskChart.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { weeklyTaskData } from '@/data/mockData';
import { colors } from '@/utils/theme';
import { userDetailPath } from '@/utils/paths';

export const TeamLeadDashboard = () => {
  const { user } = useAuth();
  const { users, tasks } = useData();
  const navigate = useNavigate();

  const teamId = user?.teamId;
  const teamMembers = useMemo(
    () => users.filter((u) => u.role === 'employee' && u.teamId === teamId),
    [users, teamId],
  );
  const teamTasks = useMemo(
    () => tasks.filter((t) => teamMembers.some((m) => m.id === t.assigneeId)),
    [tasks, teamMembers],
  );

  const counts = {
    inProgress: teamTasks.filter((t) => t.status === 'inProgress').length,
    done: teamTasks.filter((t) => t.status === 'done').length,
  };

  return (
    <AppLayout
      title="Team Dashboard"
      action={
        <button
          type="button"
          onClick={() => navigate('/team-lead/assign-task')}
          className="btn-primary"
        >
          <Send size={16} /> Assign Task
        </button>
      }
    >
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="mb-6">
          <p className="text-sm text-ink-secondary">Welcome back,</p>
          <h2 className="text-2xl font-bold text-ink">{user?.name}</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            title="Team Members"
            value={teamMembers.length}
            icon={UsersIcon}
            color={colors.primary}
          />
          <StatCard
            title="Total Tasks"
            value={teamTasks.length}
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
            title="Completed"
            value={counts.done}
            icon={CheckCircle2}
            color={colors.doneGreen}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-base p-5">
            <h3 className="mb-3 text-base font-semibold text-ink">
              Team Task Distribution
            </h3>
            <div className="h-56">
              <TaskStatusPieChart tasks={teamTasks} />
            </div>
          </div>
          <div className="card-base p-5">
            <h3 className="mb-3 text-base font-semibold text-ink">This Week</h3>
            <div className="h-56">
              <WeeklyBarChart data={weeklyTaskData} />
            </div>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="mb-3 text-base font-semibold text-ink">Team Members</h3>
          {teamMembers.length === 0 ? (
            <p className="text-sm text-ink-light">
              No team members yet — ask management to add some.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {teamMembers.map((m) => (
                <EmployeeCard
                  key={m.id}
                  user={m}
                  tasks={tasks.filter((t) => t.assigneeId === m.id)}
                  onClick={() => navigate(userDetailPath('teamLead', m.id))}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
};

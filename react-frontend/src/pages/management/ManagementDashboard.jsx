import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  Users as UsersIcon,
} from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout.jsx';
import { StatCard } from '@/components/StatCard.jsx';
import { WorkspaceCard } from '@/components/WorkspaceCard.jsx';
import { MonthlyLineChart, TaskStatusPieChart } from '@/components/TaskChart.jsx';
import { useData } from '@/context/TasksContext.jsx';
import { monthlyTaskData } from '@/data/mockData';
import { isOverdue } from '@/types';
import { colors } from '@/utils/theme';
import { userDetailPath, workspaceDetailPath } from '@/utils/paths';

export const ManagementDashboard = () => {
  const { tasks, users, workspaces, addWorkspaceMember, removeWorkspaceMember } =
    useData();
  const navigate = useNavigate();

  // Resolve memberIds → User objects so workspace cards can render the
  // members dropdown.
  const userById = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const nonMembersFor = (workspace) =>
    users.filter(
      (u) => u.role === 'employee' && !workspace.memberIds.includes(u.id),
    );

  const stats = useMemo(() => {
    const employeeCount = users.filter((u) => u.role === 'employee').length;
    const inProgress = tasks.filter((t) => t.status === 'inProgress').length;
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter((t) => isOverdue(t)).length;
    return {
      employeeCount,
      workspaceCount: workspaces.length,
      totalTasks: tasks.length,
      inProgress,
      done,
      overdue,
    };
  }, [tasks, users, workspaces]);

  return (
    <AppLayout title="Organization Overview">
      <div className="mx-auto max-w-7xl p-4 lg:p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            title="Employees"
            value={stats.employeeCount}
            icon={UsersIcon}
            color={colors.primary}
            onClick={() => navigate('/management/employees')}
          />
          <StatCard
            title="Workspaces"
            value={stats.workspaceCount}
            icon={Building2}
            color={colors.reviewPurple}
            onClick={() => navigate('/management/workspaces')}
          />
          <StatCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={ClipboardList}
            color={colors.todoGray}
            onClick={() => navigate('/management/tasks')}
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={TrendingUp}
            color={colors.progressBlue}
            onClick={() => navigate('/management/tasks?filter=inProgress')}
          />
          <StatCard
            title="Completed"
            value={stats.done}
            icon={CheckCircle2}
            color={colors.doneGreen}
            onClick={() => navigate('/management/tasks?filter=done')}
          />
          <StatCard
            title="Overdue"
            value={stats.overdue}
            icon={AlertTriangle}
            color={colors.error}
            onClick={() => navigate('/management/tasks?filter=overdue')}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="card-base p-5">
            <h3 className="mb-3 text-base font-semibold text-ink">
              Task Status Distribution
            </h3>
            <div className="h-56">
              <TaskStatusPieChart tasks={tasks} />
            </div>
          </div>
          <div className="card-base p-5">
            <h3 className="mb-3 text-base font-semibold text-ink">
              Monthly Trend
            </h3>
            <div className="h-56">
              <MonthlyLineChart data={monthlyTaskData} />
            </div>
          </div>
        </div>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold text-ink">
              Workspace Performance
            </h3>
            <button
              onClick={() => navigate('/management/workspaces')}
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workspaces.map((w) => (
              <WorkspaceCard
                key={w.id}
                workspace={w}
                members={w.memberIds
                  .map((id) => userById.get(id))
                  .filter(Boolean)}
                onMemberClick={(uid) =>
                  navigate(userDetailPath('management', uid))
                }
                canEditMembers
                nonMembers={nonMembersFor(w)}
                onAddMember={(uid) => addWorkspaceMember(w.id, uid)}
                onRemoveMember={(uid) => removeWorkspaceMember(w.id, uid)}
                onClick={() => navigate(workspaceDetailPath('management', w.id))}
              />
            ))}
          </div>
        </section>
      </div>
    </AppLayout>
  );
};

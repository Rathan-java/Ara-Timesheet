import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout.jsx';
import { AssignTaskForm } from '@/pages/common/AssignTaskForm.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';

export const AssignTaskPage = () => {
  const { user } = useAuth();
  const { users } = useData();

  const teamMembers = useMemo(
    () => users.filter((u) => u.role === 'employee' && u.teamId === user?.teamId),
    [users, user?.teamId],
  );

  return (
    <AppLayout title="Assign Task">
      <div className="mx-auto max-w-2xl p-4 lg:p-6">
        <AssignTaskForm
          assignees={teamMembers}
          assignedById={user?.id ?? ''}
          returnTo="/team-lead/team-tasks"
        />
      </div>
    </AppLayout>
  );
};

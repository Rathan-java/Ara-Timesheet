import { useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout.jsx';
import { AssignTaskForm } from '@/pages/common/AssignTaskForm.jsx';
import { useAuth } from '@/context/AuthContext.jsx';
import { useData } from '@/context/TasksContext.jsx';

export const ManagementAssignTaskPage = () => {
  const { user } = useAuth();
  const { users } = useData();

  // Management can assign to any employee.
  const employees = useMemo(
    () => users.filter((u) => u.role === 'employee'),
    [users],
  );

  return (
    <AppLayout title="Assign Task">
      <div className="mx-auto max-w-2xl p-4 lg:p-6">
        <AssignTaskForm
          assignees={employees}
          assignedById={user?.id ?? ''}
          returnTo="/management/dashboard"
        />
      </div>
    </AppLayout>
  );
};

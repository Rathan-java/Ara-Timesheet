import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute.jsx';
import { useAuth } from '@/context/AuthContext.jsx';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage.jsx';
import { RegisterPage } from '@/pages/auth/RegisterPage.jsx';

// Employee
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard.jsx';
import { EmployeeBoardPage } from '@/pages/employee/EmployeeBoardPage.jsx';
import { EmployeeTaskListPage } from '@/pages/employee/EmployeeTaskListPage.jsx';
import { TaskDetailPage } from '@/pages/employee/TaskDetailPage.jsx';
import { CreateTaskPage } from '@/pages/employee/CreateTaskPage.jsx';

// Team Lead
import { TeamLeadDashboard } from '@/pages/team-lead/TeamLeadDashboard.jsx';
import { TeamTasksPage } from '@/pages/team-lead/TeamTasksPage.jsx';
import { AssignTaskPage } from '@/pages/team-lead/AssignTaskPage.jsx';

// Management
import { ManagementDashboard } from '@/pages/management/ManagementDashboard.jsx';
import { ManagementTasksPage } from '@/pages/management/ManagementTasksPage.jsx';
import { AllEmployeesPage } from '@/pages/management/AllEmployeesPage.jsx';
import { ManagementAssignTaskPage } from '@/pages/management/ManagementAssignTaskPage.jsx';
import { CreateEmployeePage } from '@/pages/management/CreateEmployeePage.jsx';
import { CreateWorkspacePage } from '@/pages/management/CreateWorkspacePage.jsx';

// Workspaces (shared across all roles)
import { WorkspacesPage } from '@/pages/workspace/WorkspacesPage.jsx';
import { WorkspaceDetailPage } from '@/pages/workspace/WorkspaceDetailPage.jsx';

// Shared
import { ProfilePage } from '@/pages/common/ProfilePage.jsx';
import { EmployeeDetailPage } from '@/pages/common/EmployeeDetailPage.jsx';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-ink-light">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case 'employee':
      return <Navigate to="/employee/dashboard" replace />;
    case 'teamLead':
      return <Navigate to="/team-lead/dashboard" replace />;
    case 'management':
      return <Navigate to="/management/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Employee */}
      <Route
        path="/employee/dashboard"
        element={
          <ProtectedRoute role="employee">
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/board"
        element={
          <ProtectedRoute role="employee">
            <EmployeeBoardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/tasks"
        element={
          <ProtectedRoute role="employee">
            <EmployeeTaskListPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/tasks/:id"
        element={
          <ProtectedRoute role="employee">
            <TaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/create-task"
        element={
          <ProtectedRoute role="employee">
            <CreateTaskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/workspaces"
        element={
          <ProtectedRoute role="employee">
            <WorkspacesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/workspaces/:id"
        element={
          <ProtectedRoute role="employee">
            <WorkspaceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/profile"
        element={
          <ProtectedRoute role="employee">
            <ProfilePage role="employee" />
          </ProtectedRoute>
        }
      />

      {/* Team Lead */}
      <Route
        path="/team-lead/dashboard"
        element={
          <ProtectedRoute role="teamLead">
            <TeamLeadDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/team-tasks"
        element={
          <ProtectedRoute role="teamLead">
            <TeamTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/assign-task"
        element={
          <ProtectedRoute role="teamLead">
            <AssignTaskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/tasks/:id"
        element={
          <ProtectedRoute role="teamLead">
            <TaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/workspaces"
        element={
          <ProtectedRoute role="teamLead">
            <WorkspacesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/workspaces/:id"
        element={
          <ProtectedRoute role="teamLead">
            <WorkspaceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/employees/:id"
        element={
          <ProtectedRoute role="teamLead">
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/team-lead/profile"
        element={
          <ProtectedRoute role="teamLead">
            <ProfilePage role="teamLead" />
          </ProtectedRoute>
        }
      />

      {/* Management */}
      <Route
        path="/management/dashboard"
        element={
          <ProtectedRoute role="management">
            <ManagementDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/tasks"
        element={
          <ProtectedRoute role="management">
            <ManagementTasksPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/employees"
        element={
          <ProtectedRoute role="management">
            <AllEmployeesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/employees/:id"
        element={
          <ProtectedRoute role="management">
            <EmployeeDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/workspaces"
        element={
          <ProtectedRoute role="management">
            <WorkspacesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/workspaces/:id"
        element={
          <ProtectedRoute role="management">
            <WorkspaceDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/assign-task"
        element={
          <ProtectedRoute role="management">
            <ManagementAssignTaskPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/create-employee"
        element={
          <ProtectedRoute role="management">
            <CreateEmployeePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/create-workspace"
        element={
          <ProtectedRoute role="management">
            <CreateWorkspacePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/tasks/:id"
        element={
          <ProtectedRoute role="management">
            <TaskDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/profile"
        element={
          <ProtectedRoute role="management">
            <ProfilePage role="management" />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

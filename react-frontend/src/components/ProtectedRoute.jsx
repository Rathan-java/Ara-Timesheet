import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext.jsx';

export const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-ink-light">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (user.role !== role) {
    // Send users to their own dashboard if they try to access another role's area.
    const dest =
      user.role === 'employee'
        ? '/employee/dashboard'
        : user.role === 'teamLead'
          ? '/team-lead/dashboard'
          : '/management/dashboard';
    return <Navigate to={dest} replace />;
  }

  return children;
};

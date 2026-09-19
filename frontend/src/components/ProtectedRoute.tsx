import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Props = {
  children: React.ReactNode;
  allowPasswordChange?: boolean;
};

export default function ProtectedRoute({ children, allowPasswordChange = false }: Props) {
  const { loading, authenticated, mustChangePassword } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-muted">
        Checking session…
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/admin" replace state={{ from: location }} />;
  }

  if (mustChangePassword && !allowPasswordChange) {
    return <Navigate to="/admin/change-password" replace />;
  }

  if (!mustChangePassword && allowPasswordChange && location.pathname === '/admin/change-password') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <>{children}</>;
}

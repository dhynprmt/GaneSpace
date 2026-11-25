import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ErrorState, PageLoader } from "../components/ui/StateViews";

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, roles = [], role, loading, sessionError } = useAuth();

  if (loading) return <PageLoader />;
  if (sessionError && !isAuthenticated) return <ErrorState message={sessionError} onRetry={() => window.location.reload()} />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const currentRoles = new Set([...roles, role].filter(Boolean));
  if (allowedRoles.length > 0 && !allowedRoles.some((allowedRole) => currentRoles.has(allowedRole))) {
    return <Navigate to="/" replace />;
  }

  return children;
}

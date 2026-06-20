import { Navigate, Outlet, useLocation } from "react-router-dom";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute() {
  const { authError, isAuthenticated, loading, refreshCurrentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (authError) {
    return (
      <ErrorState
        title="Không thể kiểm tra phiên đăng nhập"
        message={authError.message}
        actionLabel="Thử lại"
        onAction={refreshCurrentUser}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

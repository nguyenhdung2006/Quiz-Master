import { Navigate, Outlet, useLocation } from "react-router-dom";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import { useAuth } from "./AuthContext.jsx";

export default function AdminRoute() {
  const { authError, currentUser, isAuthenticated, loading, refreshCurrentUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingState message="Đang kiểm tra quyền quản trị..." />;
  }

  if (authError) {
    return (
      <ErrorState
        title="Không thể kiểm tra quyền truy cập"
        message={authError.message}
        actionLabel="Thử lại"
        onAction={refreshCurrentUser}
      />
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (currentUser?.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

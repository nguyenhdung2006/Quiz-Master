import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

const linkClass = ({ isActive }) =>
  `rounded px-3 py-2 text-sm font-medium ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

export default function PublicLayout() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="text-lg font-semibold text-slate-950">
            QuizMaster
          </NavLink>
          <div className="flex items-center gap-1">
            <NavLink to="/quizzes" className={linkClass}>
              Quizzes
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/me/attempts" className={linkClass}>
                My Attempts
              </NavLink>
            )}
            {currentUser?.role === "ADMIN" && (
              <NavLink to="/admin/quizzes" className={linkClass}>
                Admin
              </NavLink>
            )}
            {!isAuthenticated ? (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Register
                </NavLink>
              </>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="rounded px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

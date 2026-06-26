import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PageContainer from "../components/ui/PageContainer.jsx";

const linkClass = ({ isActive }) =>
  `rounded-full px-3 py-2 text-sm font-semibold transition ${
    isActive ? "bg-violet-50 text-violet-800 ring-1 ring-violet-100" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
  }`;

export default function PublicLayout() {
  const { currentUser, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/50 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <NavLink to="/" className="flex items-center gap-2 text-lg font-bold text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-violet-600 to-indigo-700 text-lg font-bold text-white shadow-sm shadow-violet-200">
              ?
            </span>
            <span>Quiz<span className="text-violet-700">Master</span></span>
          </NavLink>
          <div className="flex flex-wrap items-center justify-end gap-1.5">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/quizzes" className={linkClass}>
              Quizzes
            </NavLink>
            {isAuthenticated && (
              <NavLink to="/attempts" className={linkClass}>
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
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-indigo-800 text-white"
                        : "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-sm shadow-violet-200 hover:from-violet-700 hover:to-indigo-800"
                    }`
                  }
                >
                  Register
                </NavLink>
              </>
            ) : (
              <>
                <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 sm:inline">
                  {currentUser.email} - {currentUser.role}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </nav>
      </header>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </div>
  );
}

import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PageContainer from "../components/ui/PageContainer.jsx";
import { classNames } from "../components/ui/classNames.js";

const linkClass = ({ isActive }) =>
  classNames(
    "whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100",
    isActive
      ? "bg-white text-violet-800 shadow-sm ring-1 ring-violet-100"
      : "text-slate-600 hover:bg-white/80 hover:text-slate-950",
  );

const actionLinkClass = ({ isActive }) =>
  classNames(
    "whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100",
    isActive
      ? "bg-indigo-800 text-white shadow-sm"
      : "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-sm shadow-violet-200 hover:from-violet-700 hover:to-indigo-800",
  );

function BrandLink({ admin = false }) {
  return (
    <NavLink to="/" className="flex shrink-0 items-center gap-2.5 text-lg font-bold text-slate-950">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-b from-violet-600 to-indigo-700 text-lg font-bold text-white shadow-sm shadow-violet-200">
        ?
      </span>
      <span className="leading-none">
        Quiz<span className="text-violet-700">Master</span>
        {admin && <span className="ml-2 align-middle text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</span>}
      </span>
    </NavLink>
  );
}

export default function PublicLayout() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 shadow-sm shadow-slate-200/50 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <BrandLink />
            {isAuthenticated && (
              <span className="max-w-[12rem] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 lg:hidden">
                {currentUser?.role}
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            <div className="-mx-1 flex min-w-0 items-center gap-1 overflow-x-auto rounded-full bg-slate-100/80 p-1 ring-1 ring-slate-200/70 sm:mx-0">
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
              {isAdmin && (
                <NavLink to="/admin/quizzes" className={linkClass}>
                  Admin
                </NavLink>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login" className={linkClass}>
                    Login
                  </NavLink>
                  <NavLink to="/register" className={actionLinkClass}>
                    Register
                  </NavLink>
                </>
              ) : (
                <>
                  <span className="hidden max-w-[16rem] truncate rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 lg:inline">
                    {currentUser.email} - {currentUser.role}
                  </span>
                  <button
                    type="button"
                    onClick={logout}
                    className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>
      <PageContainer>
        <Outlet />
      </PageContainer>
    </div>
  );
}

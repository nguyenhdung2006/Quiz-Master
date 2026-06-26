import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import PageContainer from "../components/ui/PageContainer.jsx";
import { classNames } from "../components/ui/classNames.js";

const linkClass = ({ isActive }) =>
  classNames(
    "flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition",
    isActive
      ? "bg-violet-50 text-violet-700 ring-1 ring-violet-100"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950",
  );

export default function AdminLayout() {
  const { currentUser, logout } = useAuth();

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-slate-200 bg-white/95 px-4 py-4 shadow-sm shadow-slate-200/60 lg:w-72 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4">
              <NavLink to="/" className="group flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-violet-600 to-indigo-700 text-lg font-bold text-white shadow-sm shadow-violet-200">
                  ?
                </span>
                <span>
                  <span className="block text-lg font-bold text-slate-950">
                    Quiz<span className="text-violet-700">Master</span>
                  </span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Admin
                  </span>
                </span>
              </NavLink>

              <button
                type="button"
                onClick={logout}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 lg:hidden"
              >
                Logout
              </button>
            </div>

            <nav className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <NavLink to="/admin/quizzes" className={linkClass}>
                <span>Quizzes</span>
                <span className="text-xs text-current opacity-60">Manage</span>
              </NavLink>
              <NavLink to="/admin/categories" className={linkClass}>
                <span>Categories</span>
                <span className="text-xs text-current opacity-60">Subjects</span>
              </NavLink>
              <NavLink to="/quizzes" className={linkClass}>
                <span>Public site</span>
                <span className="text-xs text-current opacity-60">View</span>
              </NavLink>
            </nav>

            <div className="hidden rounded-xl border border-slate-200 bg-slate-50 p-4 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed in</p>
              <p className="mt-2 break-all text-sm font-semibold text-slate-900">{currentUser?.email}</p>
              <p className="mt-1 text-xs font-medium text-violet-700">{currentUser?.role}</p>
              <button
                type="button"
                onClick={logout}
                className="mt-4 w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-slate-200 bg-white/80 px-4 py-4 shadow-sm shadow-slate-200/40 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-violet-700">QuizMaster Admin</p>
                <p className="text-sm text-slate-500">Manage real quiz content and publishing state.</p>
              </div>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 sm:inline-flex">
                {currentUser?.role}
              </span>
            </div>
          </header>

          <PageContainer className="max-w-7xl py-6 lg:py-8">
            <Outlet />
          </PageContainer>
        </div>
      </div>
    </div>
  );
}

import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `rounded px-3 py-2 text-sm font-medium ${
    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
  }`;

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/" className="text-lg font-semibold text-slate-950">
            QuizMaster Admin
          </NavLink>
          <div className="flex items-center gap-1">
            <NavLink to="/admin/quizzes" className={linkClass}>
              Quizzes
            </NavLink>
            <NavLink to="/admin/quizzes/new" className={linkClass}>
              New Quiz
            </NavLink>
            <NavLink to="/admin/categories" className={linkClass}>
              Categories
            </NavLink>
            <NavLink to="/quizzes" className={linkClass}>
              Public Site
            </NavLink>
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

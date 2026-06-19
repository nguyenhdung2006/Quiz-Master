import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminQuizzes } from "../../api/adminQuizApi.js";
import AdminQuizList from "../../components/admin/AdminQuizList.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";

export default function AdminQuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadQuizzes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAdminQuizzes();
      setQuizzes(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">Admin Quizzes</h1>
            <p className="mt-2 text-sm text-slate-500">
              Review draft and published quizzes before editing their details.
            </p>
          </div>
          <Link
            to="/admin/quizzes/new"
            className="inline-flex rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
          >
            Create quiz
          </Link>
        </div>
      </section>

      {loading && <LoadingState message="Loading quizzes..." />}

      {!loading && error && (
        <ErrorState
          title="Could not load admin quizzes."
          message={error.message || "Please check your connection and try again."}
          actionLabel="Try again"
          onAction={loadQuizzes}
        />
      )}

      {!loading && !error && quizzes.length === 0 && (
        <EmptyState title="No quizzes yet." message="Create a draft quiz to get started." />
      )}

      {!loading && !error && quizzes.length > 0 && <AdminQuizList quizzes={quizzes} />}
    </div>
  );
}

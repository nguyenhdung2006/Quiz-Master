import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../../api/adminCategoryApi.js";
import {
  createAdminQuiz,
  getAdminQuiz,
  updateAdminQuiz,
} from "../../api/adminQuizApi.js";
import QuizMetadataForm from "../../components/admin/QuizMetadataForm.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";

export default function AdminQuizEditorPage() {
  const { id, quizId } = useParams();
  const routeQuizId = quizId || id;
  const editing = Boolean(routeQuizId);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      const [categoryData, quizData] = await Promise.all([
        getCategories(),
        editing ? getAdminQuiz(routeQuizId) : Promise.resolve(null),
      ]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setQuiz(quizData);
    } catch (error) {
      setLoadError(error);
    } finally {
      setLoading(false);
    }
  }, [editing, routeQuizId]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleSubmit(payload) {
    setSaving(true);
    setSaveError(null);
    setSuccessMessage(null);

    try {
      if (editing) {
        const updatedQuiz = await updateAdminQuiz(routeQuizId, payload);
        setQuiz((current) => ({ ...current, ...updatedQuiz }));
        setSuccessMessage("Quiz metadata saved.");
        return;
      }

      const createdQuiz = await createAdminQuiz(payload);
      navigate(`/admin/quizzes/${createdQuiz.id}/edit`, { replace: true });
    } catch (error) {
      setSaveError(error.message || "Could not save quiz.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message={editing ? "Loading quiz..." : "Loading categories..."} />;
  }

  if (loadError) {
    return (
      <ErrorState
        title={loadError.status === 404 ? "Quiz not found." : "Could not load quiz editor."}
        message={loadError.message || "Please check your connection and try again."}
        actionLabel={loadError.status === 404 ? "Back to quizzes" : "Try again"}
        onAction={loadError.status === 404 ? () => navigate("/admin/quizzes") : loadPage}
      />
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Admin</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-950">
              {editing ? "Edit Quiz" : "Create Quiz"}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {editing
                ? "Update quiz metadata without changing questions or publish state."
                : "Create a draft quiz by setting its basic metadata."}
            </p>
          </div>
          <Link
            to="/admin/quizzes"
            className="inline-flex rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200"
          >
            Back to quiz list
          </Link>
        </div>
      </section>

      {categories.length === 0 && (
        <EmptyState title="No categories available." message="Create a category before creating quizzes." />
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <QuizMetadataForm
          categories={categories}
          initialQuiz={quiz}
          saving={saving}
          error={saveError}
          successMessage={successMessage}
          onSubmit={handleSubmit}
        />

        <aside className="space-y-4">
          <QuizStatusCard quiz={quiz} editing={editing} />
          <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-lg font-semibold text-slate-950">Questions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Question editor coming in the next phase.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function QuizStatusCard({ quiz, editing }) {
  const published = Boolean(quiz?.published);

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-950">Status</h2>
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publication</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question count</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {editing ? quiz?.questionCount ?? 0 : 0}
          </p>
        </div>

        <p className="text-sm leading-6 text-slate-500">
          This form only changes quiz metadata.
        </p>
      </div>
    </section>
  );
}

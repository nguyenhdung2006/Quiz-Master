import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getCategories } from "../../api/adminCategoryApi.js";
import {
  createAdminQuiz,
  createAdminQuestion,
  deleteAdminQuestion,
  getAdminQuiz,
  publishAdminQuiz,
  unpublishAdminQuiz,
  updateAdminQuestion,
  updateAdminQuiz,
} from "../../api/adminQuizApi.js";
import PublishStatusCard from "../../components/admin/PublishStatusCard.jsx";
import QuestionEditor from "../../components/admin/QuestionEditor.jsx";
import QuestionList from "../../components/admin/QuestionList.jsx";
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
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [questionError, setQuestionError] = useState(null);
  const [questionSaving, setQuestionSaving] = useState(false);
  const [confirmingDeleteQuestionId, setConfirmingDeleteQuestionId] = useState(null);
  const [deletingQuestionId, setDeletingQuestionId] = useState(null);
  const [publishError, setPublishError] = useState(null);
  const [publishMessage, setPublishMessage] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const loadPage = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setSaveError(null);
    setSuccessMessage(null);
    setQuestionError(null);
    setPublishError(null);
    setPublishMessage(null);

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

  async function handleQuestionSubmit(payload) {
    setQuestionSaving(true);
    setQuestionError(null);
    setPublishMessage(null);

    try {
      if (editingQuestion) {
        await updateAdminQuestion(editingQuestion.id, payload);
      } else {
        await createAdminQuestion(routeQuizId, payload);
      }

      setEditingQuestion(null);
      await loadPage();
    } catch (error) {
      setQuestionError(error.message || "Could not save question.");
    } finally {
      setQuestionSaving(false);
    }
  }

  async function handleDeleteQuestion(question) {
    setDeletingQuestionId(question.id);
    setQuestionError(null);

    try {
      await deleteAdminQuestion(question.id);
      setConfirmingDeleteQuestionId(null);
      if (editingQuestion?.id === question.id) {
        setEditingQuestion(null);
      }
      await loadPage();
    } catch (error) {
      setQuestionError(error.message || "Could not delete question.");
    } finally {
      setDeletingQuestionId(null);
    }
  }

  async function handleTogglePublish() {
    setPublishing(true);
    setPublishError(null);
    setPublishMessage(null);
    setQuestionError(null);

    try {
      if (quiz?.published) {
        await unpublishAdminQuiz(routeQuizId);
        await loadPage();
        setPublishMessage("Quiz unpublished.");
      } else {
        await publishAdminQuiz(routeQuizId);
        await loadPage();
        setPublishMessage("Quiz published.");
      }
    } catch (error) {
      setPublishError(error.message || "Could not update publish status.");
    } finally {
      setPublishing(false);
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
                ? "Manage quiz metadata, questions, and publish status."
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
          <PublishStatusCard
            editing={editing}
            error={publishError}
            message={publishMessage}
            onTogglePublish={handleTogglePublish}
            publishing={publishing}
            quiz={quiz}
          />
        </aside>
      </div>

      {editing && (
        <section className="space-y-5">
          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-semibold text-slate-950">Questions</h2>
            <p className="mt-2 text-sm text-slate-500">
              Add single-choice questions with exactly one correct option.
            </p>
          </div>

          <QuestionEditor
            defaultDisplayOrder={(quiz?.questions || []).length + 1}
            disabled={Boolean(quiz?.published)}
            editingQuestion={editingQuestion}
            error={questionError}
            saving={questionSaving}
            onCancelEdit={() => {
              setEditingQuestion(null);
              setQuestionError(null);
            }}
            onSubmit={handleQuestionSubmit}
          />

          <QuestionList
            confirmingDeleteId={confirmingDeleteQuestionId}
            deletingId={deletingQuestionId}
            disabled={Boolean(quiz?.published)}
            onCancelDelete={() => setConfirmingDeleteQuestionId(null)}
            onConfirmDelete={handleDeleteQuestion}
            onEdit={(question) => {
              setEditingQuestion(question);
              setConfirmingDeleteQuestionId(null);
              setQuestionError(null);
            }}
            onRequestDelete={(question) => {
              setConfirmingDeleteQuestionId(question.id);
              setQuestionError(null);
            }}
            questions={quiz?.questions || []}
          />
        </section>
      )}
    </div>
  );
}

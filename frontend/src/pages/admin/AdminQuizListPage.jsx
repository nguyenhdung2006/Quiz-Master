import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminQuizzes } from "../../api/adminQuizApi.js";
import AdminQuizList from "../../components/admin/AdminQuizList.jsx";
import EmptyState from "../../components/common/EmptyState.jsx";
import ErrorState from "../../components/common/ErrorState.jsx";
import LoadingState from "../../components/common/LoadingState.jsx";
import Button from "../../components/ui/Button.jsx";
import PageHeader from "../../components/ui/PageHeader.jsx";

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
      <PageHeader
        eyebrow="Admin"
        title="Quiz management"
        actions={
          <Button as={Link} to="/admin/quizzes/new">
            Create quiz
          </Button>
        }
      >
        Review draft and published quizzes before editing metadata, questions, or publish status.
      </PageHeader>

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

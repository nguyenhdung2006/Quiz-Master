import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAttempts } from "../api/attemptApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import AttemptHistoryList from "../components/attempt/AttemptHistoryList.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import Button from "../components/ui/Button.jsx";
import PageHeader from "../components/ui/PageHeader.jsx";

export default function MyAttemptsPage() {
  const { currentUser } = useAuth();
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAttempts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setAttempts([]);

    try {
      const data = await getMyAttempts();
      setAttempts(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadForCurrentUser() {
      setLoading(true);
      setError(null);
      setAttempts([]);

      try {
        const data = await getMyAttempts();
        if (active) {
          setAttempts(Array.isArray(data) ? data : []);
        }
      } catch (requestError) {
        if (active) {
          setError(requestError);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadForCurrentUser();

    return () => {
      active = false;
    };
  }, [currentUser?.email]);

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="History" title="My Attempts">
        <p>Review submitted quiz attempts, open detailed results, and revisit answer explanations.</p>
      </PageHeader>

      {loading && <LoadingState message="Loading your attempts..." />}

      {!loading && error && (
        <ErrorState
          title="Could not load your attempts."
          message={error.message || "Please check your connection and try again."}
          actionLabel="Try again"
          onAction={loadAttempts}
        />
      )}

      {!loading && !error && attempts.length === 0 && (
        <EmptyAttemptsState />
      )}

      {!loading && !error && attempts.length > 0 && <AttemptHistoryList attempts={attempts} />}
    </div>
  );
}

function EmptyAttemptsState() {
  return (
    <div className="space-y-4">
      <EmptyState title="No attempts yet." message="Start a quiz to see your history here." />
      <Button as={Link} to="/quizzes">
        Browse quizzes
      </Button>
    </div>
  );
}

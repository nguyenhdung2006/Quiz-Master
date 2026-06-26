import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAttempts } from "../api/attemptApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import AttemptHistoryList from "../components/attempt/AttemptHistoryList.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
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

      {!loading && !error && attempts.length > 0 && (
        <Card className="border-violet-100 shadow-violet-100/70" padding="lg">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-slate-950">Attempt history</h2>
            <p className="mt-1 text-sm text-slate-500">
              {attempts.length} attempt{attempts.length === 1 ? "" : "s"} found for your account.
            </p>
          </div>
          <AttemptHistoryList attempts={attempts} />
        </Card>
      )}
    </div>
  );
}

function EmptyAttemptsState() {
  return (
    <div className="space-y-4">
      <EmptyState
        title="No submitted attempts yet."
        message="Start and submit a quiz to see your result and answer review here."
      />
      <Button as={Link} to="/quizzes">
        Browse quizzes
      </Button>
    </div>
  );
}

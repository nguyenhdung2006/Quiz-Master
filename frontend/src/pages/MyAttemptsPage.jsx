import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyAttempts } from "../api/attemptApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import AttemptHistoryList from "../components/attempt/AttemptHistoryList.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";

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
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">History</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">My Attempts</h1>
        <p className="mt-2 text-sm text-slate-500">Review your completed quiz attempts.</p>
      </section>

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
      <Link
        to="/quizzes"
        className="inline-flex rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
      >
        Browse quizzes
      </Link>
    </div>
  );
}

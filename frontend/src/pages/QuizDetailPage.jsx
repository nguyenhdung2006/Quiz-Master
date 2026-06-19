import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { startAttempt } from "../api/attemptApi.js";
import { getQuizDetail } from "../api/publicQuizApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";

export default function QuizDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [startError, setStartError] = useState("");
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadQuiz() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const data = await getQuizDetail(id);
        if (active) {
          setQuiz(data);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError.status === 404) {
          setNotFound(true);
          setQuiz(null);
        } else {
          setError(requestError.message || "Unable to load quiz detail.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadQuiz();

    return () => {
      active = false;
    };
  }, [id]);

  async function handleStartQuiz() {
    if (authLoading || starting) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    setStarting(true);
    setStartError("");

    try {
      const attempt = await startAttempt(quiz.id);
      navigate(`/attempts/${attempt.attemptId}/take`, { state: { attempt } });
    } catch (requestError) {
      setStartError(requestError.message || "Unable to start this quiz.");
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading quiz detail..." />;
  }

  if (notFound) {
    return (
      <ErrorState
        title="Quiz not found"
        message="This quiz is unavailable or has not been published."
        actionLabel="Back to catalog"
        onAction={() => navigate("/quizzes")}
      />
    );
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Back to catalog" onAction={() => navigate("/quizzes")} />;
  }

  return (
    <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
            {quiz?.category?.name || "Quiz"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{quiz?.title}</h1>
          {quiz?.description && <p className="mt-4 leading-7 text-slate-600">{quiz.description}</p>}

          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            <Metadata label="Questions" value={quiz?.questionCount ?? 0} />
            <Metadata label="Time limit" value={quiz?.timeLimitMinutes ? `${quiz.timeLimitMinutes} minutes` : "None"} />
          </dl>
        </div>

        <div className="w-full rounded-lg bg-slate-50 p-4 ring-1 ring-slate-200 md:w-72">
          <p className="text-sm text-slate-600">Ready to start?</p>
          <button
            type="button"
            onClick={handleStartQuiz}
            disabled={authLoading || starting}
            className="mt-4 w-full rounded-md bg-purple-700 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-300"
          >
            {starting ? "Starting..." : authLoading ? "Checking session..." : "Start quiz"}
          </button>
          {startError && <p className="mt-3 text-sm text-red-700">{startError}</p>}
        </div>
      </div>
    </article>
  );
}

function Metadata({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

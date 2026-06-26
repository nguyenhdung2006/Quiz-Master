import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { startAttempt } from "../api/attemptApi.js";
import { getQuizDetail } from "../api/publicQuizApi.js";
import { useAuth } from "../auth/AuthContext.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

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
  const startLockRef = useRef(false);

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
    if (authLoading || startLockRef.current) {
      return;
    }

    if (!isAuthenticated) {
      navigate("/login", { state: { from: location } });
      return;
    }

    startLockRef.current = true;
    setStarting(true);
    setStartError("");

    try {
      const attempt = await startAttempt(quiz.id);
      navigate(`/attempts/${attempt.attemptId}/take`, { state: { attempt } });
    } catch (requestError) {
      setStartError(requestError.message || "Unable to start this quiz.");
    } finally {
      startLockRef.current = false;
      setStarting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Loading quiz detail..." />;
  }

  if (notFound) {
    return (
      <ErrorState
        title="Quiz not found."
        message="This quiz does not exist or has not been published."
        actionLabel="Back to catalog"
        onAction={() => navigate("/quizzes")}
      />
    );
  }

  if (error) {
    return <ErrorState message={error} actionLabel="Back to catalog" onAction={() => navigate("/quizzes")} />;
  }

  return (
    <article className="space-y-6">
      <Card className="overflow-hidden border-violet-100 shadow-violet-100/70" padding="none">
        <div className="grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8 lg:p-10">
          <div className="max-w-3xl">
            <Badge variant="purple">{quiz?.category?.name || "Quiz"}</Badge>
            <h1 className="mt-5 text-3xl font-bold leading-tight text-slate-950 md:text-5xl">{quiz?.title}</h1>
            {quiz?.description && <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">{quiz.description}</p>}

            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              <Metadata label="Questions" value={quiz?.questionCount ?? 0} />
              <Metadata label="Time limit" value={quiz?.timeLimitMinutes ? `${quiz.timeLimitMinutes} minutes` : "None"} />
            </dl>
          </div>

          <aside className="rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-sm shadow-violet-100/70 md:p-6">
            <p className="text-sm font-bold text-violet-950">Ready to start?</p>
            <p className="mt-2 text-sm leading-6 text-violet-950/75">
              Start from the normal quiz flow. Results and review are available after submission.
            </p>
            <Button
              type="button"
              onClick={handleStartQuiz}
              disabled={authLoading || starting}
              className="mt-5 w-full"
              size="lg"
            >
              {starting ? "Starting..." : authLoading ? "Checking session..." : "Start quiz"}
            </Button>
            <Button as="button" type="button" onClick={() => navigate("/quizzes")} className="mt-3 w-full" variant="secondary">
              Back to catalog
            </Button>
            {startError && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{startError}</p>}
          </aside>
        </div>
      </Card>

      <Card padding="lg">
        <div className="grid gap-4 md:grid-cols-3">
          <DetailNote title="Public-safe detail" text="This page shows quiz metadata only." />
          <DetailNote title="Attempt required" text="Questions appear only after a user starts an attempt." />
          <DetailNote title="Review after submit" text="Correct answers and explanations remain post-submit." />
        </div>
      </Card>
    </article>
  );
}

function Metadata({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <dt className="text-sm font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 text-xl font-bold text-slate-950">{value}</dd>
    </div>
  );
}

function DetailNote({ title, text }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <h2 className="text-sm font-bold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

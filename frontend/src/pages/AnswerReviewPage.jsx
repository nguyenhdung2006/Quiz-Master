import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAttemptResult } from "../api/attemptApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import ReviewQuestionCard from "../components/attempt/ReviewQuestionCard.jsx";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function AnswerReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadReview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAttemptResult(attemptId);
      setResult(data);
    } catch (requestError) {
      setError(toReviewError(requestError));
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadReview();
  }, [loadReview]);

  if (loading) {
    return <LoadingState message="Loading answer review..." />;
  }

  if (error) {
    return (
      <ErrorState
        title={error.title}
        message={error.message}
        actionLabel={error.retry ? "Try again" : "Back to quizzes"}
        onAction={error.retry ? loadReview : () => navigate("/quizzes")}
      />
    );
  }

  const questions = result.questions || [];
  const skippedCount = questions.filter((question) => question.selectedOptionId == null).length;
  const wrongCount =
    result.wrongCount ?? Math.max(0, (result.totalQuestions || 0) - (result.correctCount || 0) - skippedCount);

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <Badge variant="purple">Answer review</Badge>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{result.quizTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Score {result.scorePercentage}% - {result.correctCount}/{result.totalQuestions} correct
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button as={Link} to={`/attempts/${result.attemptId}/result`}>
              Result
            </Button>
            <Button as={Link} to="/quizzes" variant="secondary">
              Back to quizzes
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          {questions.map((question, index) => (
            <ReviewQuestionCard key={question.questionId} question={question} questionNumber={index + 1} />
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card padding="lg">
            <h2 className="text-sm font-semibold text-slate-900">Review summary</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <SummaryRow label="Score" value={`${result.scorePercentage}%`} />
              <SummaryRow label="Correct" tone="success" value={result.correctCount ?? 0} />
              <SummaryRow label="Wrong" tone="danger" value={wrongCount} />
              <SummaryRow label="Skipped" tone="warning" value={skippedCount} />
            </div>
          </Card>

          <Card padding="lg">
            <h2 className="text-sm font-semibold text-slate-900">Questions</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const skipped = question.selectedOptionId == null;
                const statusClass = skipped
                  ? "bg-slate-100 text-slate-600"
                  : question.correct
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-red-100 text-red-800";

                return (
                  <span
                    key={question.questionId}
                    className={`flex h-10 items-center justify-center rounded-full text-sm font-bold ${statusClass}`}
                  >
                    {index + 1}
                  </span>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, tone = "neutral", value }) {
  const toneClass = {
    danger: "text-red-700",
    neutral: "text-slate-950",
    success: "text-emerald-700",
    warning: "text-amber-700",
  }[tone];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className={`font-bold ${toneClass}`}>{value}</span>
    </div>
  );
}

function toReviewError(error) {
  if (error.status === 403) {
    return {
      title: "Access denied",
      message: "You do not have permission to view this review.",
    };
  }

  if (error.status === 404) {
    return {
      title: "Review not found",
      message: "This attempt review does not exist or does not belong to your account.",
    };
  }

  if (error.status === 400) {
    return {
      title: "Review unavailable",
      message: error.message || "This attempt has not been submitted yet.",
    };
  }

  return {
    title: "Unable to load review",
    message: error.message || "Please check your connection and try again.",
    retry: true,
  };
}

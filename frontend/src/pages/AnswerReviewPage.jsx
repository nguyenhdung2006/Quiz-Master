import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getAttemptResult } from "../api/attemptApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import ReviewQuestionCard from "../components/attempt/ReviewQuestionCard.jsx";

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

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Answer review</p>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-950">{result.quizTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Score {result.scorePercentage}% - {result.correctCount}/{result.totalQuestions} correct
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              to={`/attempts/${result.attemptId}/result`}
              className="rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
            >
              Result
            </Link>
            <Link
              to="/quizzes"
              className="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            >
              Back to quizzes
            </Link>
          </div>
        </div>
      </section>

      {(result.questions || []).map((question, index) => (
        <ReviewQuestionCard key={question.questionId} question={question} questionNumber={index + 1} />
      ))}
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

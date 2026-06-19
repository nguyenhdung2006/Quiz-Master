import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAttemptResult } from "../api/attemptApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import ResultSummary from "../components/attempt/ResultSummary.jsx";

export default function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadResult = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getAttemptResult(attemptId);
      setResult(data);
    } catch (requestError) {
      setError(toResultError(requestError));
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    loadResult();
  }, [loadResult]);

  if (loading) {
    return <LoadingState message="Loading attempt result..." />;
  }

  if (error) {
    return (
      <ErrorState
        title={error.title}
        message={error.message}
        actionLabel={error.retry ? "Try again" : "Back to quizzes"}
        onAction={error.retry ? loadResult : () => navigate("/quizzes")}
      />
    );
  }

  return <ResultSummary result={result} />;
}

function toResultError(error) {
  if (error.status === 403) {
    return {
      title: "Access denied",
      message: "You do not have permission to view this attempt.",
    };
  }

  if (error.status === 404) {
    return {
      title: "Result not found",
      message: "This attempt result does not exist or does not belong to your account.",
    };
  }

  if (error.status === 400) {
    return {
      title: "Result unavailable",
      message: error.message || "This attempt has not been submitted yet.",
    };
  }

  return {
    title: "Unable to load result",
    message: error.message || "Please check your connection and try again.",
    retry: true,
  };
}

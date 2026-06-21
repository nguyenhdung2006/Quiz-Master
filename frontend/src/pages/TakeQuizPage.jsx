import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getTakeAttempt, submitAttempt } from "../api/attemptApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import LoadingState from "../components/common/LoadingState.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";
import Badge from "../components/ui/Badge.jsx";
import ProgressBar from "../components/quiz/ProgressBar.jsx";
import QuestionCard from "../components/quiz/QuestionCard.jsx";
import QuestionNavigator from "../components/quiz/QuestionNavigator.jsx";

function getStoredAnswerKey(attemptId) {
  return `quizmaster.takeAttempt.${attemptId}.answers`;
}

function readStoredAnswers(attemptId) {
  if (!attemptId) {
    return {};
  }

  try {
    const storedValue = localStorage.getItem(getStoredAnswerKey(attemptId));
    return storedValue ? JSON.parse(storedValue) : {};
  } catch {
    return {};
  }
}

function writeStoredAnswers(attemptId, answers) {
  if (!attemptId) {
    return;
  }

  localStorage.setItem(getStoredAnswerKey(attemptId), JSON.stringify(answers));
}

function clearStoredAnswers(attemptId) {
  if (!attemptId) {
    return;
  }

  localStorage.removeItem(getStoredAnswerKey(attemptId));
}

export default function TakeQuizPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const stateAttempt = location.state?.attempt;
  const initialAttempt =
    stateAttempt &&
    String(stateAttempt.attemptId) === String(attemptId) &&
    stateAttempt.questions?.length > 0
      ? stateAttempt
      : null;
  const [attempt, setAttempt] = useState(initialAttempt);
  const [loadingAttempt, setLoadingAttempt] = useState(!initialAttempt);
  const [loadError, setLoadError] = useState("");
  const questions = useMemo(() => attempt?.questions || [], [attempt]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState(() => readStoredAnswers(attemptId));
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    setSelectedAnswers(readStoredAnswers(attemptId));
    setCurrentIndex(0);
  }, [attemptId]);

  useEffect(() => {
    let active = true;

    async function loadAttempt() {
      if (initialAttempt) {
        setAttempt(initialAttempt);
        setLoadingAttempt(false);
        setLoadError("");
        return;
      }

      setLoadingAttempt(true);
      setLoadError("");

      try {
        const restoredAttempt = await getTakeAttempt(attemptId);

        if (!active) {
          return;
        }

        if (restoredAttempt.submitted) {
          clearStoredAnswers(attemptId);
          navigate(`/attempts/${attemptId}/result`, { replace: true });
          return;
        }

        if (!restoredAttempt.questions?.length) {
          setLoadError("This attempt does not have questions available.");
          setAttempt(null);
          return;
        }

        setAttempt(restoredAttempt);
      } catch (requestError) {
        if (active) {
          setLoadError(requestError.message || "Unable to load this attempt.");
          setAttempt(null);
        }
      } finally {
        if (active) {
          setLoadingAttempt(false);
        }
      }
    }

    loadAttempt();

    return () => {
      active = false;
    };
  }, [attemptId, initialAttempt, navigate]);

  if (loadingAttempt) {
    return <LoadingState message="Restoring your quiz attempt..." />;
  }

  if (!attempt || String(attempt.attemptId) !== String(attemptId) || questions.length === 0) {
    return (
      <ErrorState
        title="Cannot load this attempt"
        message={loadError || "Please start the quiz again."}
        actionLabel="Back to quizzes"
        onAction={() => navigate("/quizzes")}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questions.length;

  function handleSelectOption(questionId, optionId) {
    setSelectedAnswers((answers) => {
      const nextAnswers = {
        ...answers,
        [questionId]: optionId,
      };
      writeStoredAnswers(attemptId, nextAnswers);
      return nextAnswers;
    });
  }

  function goPrevious() {
    setCurrentIndex((index) => Math.max(index - 1, 0));
  }

  function goNext() {
    setCurrentIndex((index) => Math.min(index + 1, totalQuestions - 1));
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    const unansweredCount = totalQuestions - answeredCount;
    let shouldSubmit = true;

    if (answeredCount === 0) {
      shouldSubmit = window.confirm("You have not selected any answers. Submit blank attempt?");
    } else if (unansweredCount > 0) {
      shouldSubmit = window.confirm(
        `You still have ${unansweredCount} unanswered questions. Unanswered questions will be counted as incorrect. Submit anyway?`,
      );
    }

    if (!shouldSubmit) {
      return;
    }

    const answers = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
      questionId: Number(questionId),
      optionId,
    }));

    setSubmitting(true);
    setSubmitError("");

    try {
      await submitAttempt(attemptId, answers);
      clearStoredAnswers(attemptId);
      navigate(`/attempts/${attemptId}/result`);
    } catch (requestError) {
      setSubmitError(requestError.message || "Unable to submit this attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card padding="lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Badge variant="purple">Take quiz</Badge>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{attempt.quizTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Question {currentIndex + 1} of {totalQuestions}
              {attempt.timeLimitMinutes ? ` - ${attempt.timeLimitMinutes} minutes` : ""}
            </p>
          </div>
          <Link to="/quizzes" className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            Back to quizzes
          </Link>
        </div>
        <div className="mt-6 max-w-3xl">
          <ProgressBar value={answeredCount} max={totalQuestions} />
        </div>
      </Card>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm leading-6 text-red-700">
          {submitError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionId={selectedAnswers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
          />

          <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between" padding="md">
            <Button
              type="button"
              onClick={goPrevious}
              disabled={currentIndex === 0}
              variant="secondary"
            >
              Previous
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {currentIndex < totalQuestions - 1 ? (
                <Button
                  type="button"
                  onClick={goNext}
                >
                  Next
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </Card>
        </div>

        <QuestionNavigator
          answeredCount={answeredCount}
          questions={questions}
          currentIndex={currentIndex}
          quizTitle={attempt.quizTitle}
          selectedAnswers={selectedAnswers}
          timeLimitMinutes={attempt.timeLimitMinutes}
          totalQuestions={totalQuestions}
          onSelectQuestion={setCurrentIndex}
        />
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [submitReviewOpen, setSubmitReviewOpen] = useState(false);
  const submitLockRef = useRef(false);
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questions.length;
  const unansweredCount = Math.max(totalQuestions - answeredCount, 0);

  useEffect(() => {
    setSelectedAnswers(readStoredAnswers(attemptId));
    setCurrentIndex(0);
    setSubmitError("");
    setSubmitReviewOpen(false);
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

  useEffect(() => {
    if (totalQuestions > 0 && answeredCount === totalQuestions) {
      setSubmitReviewOpen(false);
    }
  }, [answeredCount, totalQuestions]);

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

  function handleSelectOption(questionId, optionId) {
    setSubmitError("");
    setSubmitReviewOpen(false);
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

  function getSubmitWarningMessage() {
    if (answeredCount === 0) {
      return "You have not selected any answers. A blank attempt can be submitted, but every question will be counted as incorrect.";
    }

    if (unansweredCount > 0) {
      return `${unansweredCount} question${unansweredCount === 1 ? "" : "s"} unanswered. Unanswered questions will be counted as incorrect.`;
    }

    return "";
  }

  async function handleSubmit({ skipWarning = false } = {}) {
    if (submitLockRef.current) {
      return;
    }

    const submitWarning = getSubmitWarningMessage();

    if (submitWarning && !skipWarning) {
      setSubmitError("");
      setSubmitReviewOpen(true);
      return;
    }

    const answers = Object.entries(selectedAnswers).map(([questionId, optionId]) => ({
      questionId: Number(questionId),
      optionId,
    }));

    submitLockRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      await submitAttempt(attemptId, answers);
      clearStoredAnswers(attemptId);
      navigate(`/attempts/${attemptId}/result`);
    } catch (requestError) {
      setSubmitError(requestError.message || "Unable to submit this attempt.");
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-violet-100 shadow-violet-100/70" padding="none">
        <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <Badge variant="purple">Take quiz</Badge>
              <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">{attempt.quizTitle}</h1>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="neutral">
                  Question {currentIndex + 1} of {totalQuestions}
                </Badge>
                <Badge variant={answeredCount === totalQuestions ? "success" : "purple"}>
                  Answered {answeredCount}/{totalQuestions}
                </Badge>
                {attempt.timeLimitMinutes ? (
                  <Badge variant="neutral">Time limit: {attempt.timeLimitMinutes} minutes</Badge>
                ) : (
                  <Badge variant="neutral">No time limit</Badge>
                )}
              </div>
            </div>
            <Link to="/quizzes" className="text-sm font-semibold text-slate-500 transition hover:text-slate-800">
              Back to quizzes
            </Link>
          </div>
        </div>

        <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1fr_260px] lg:p-8">
          <div className="max-w-3xl">
            <ProgressBar label="Answered" value={answeredCount} max={totalQuestions} />
          </div>
          <div className="rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm leading-6 text-violet-950">
            {answeredCount > 0
              ? "Your selections are saved on this device until you submit."
              : "Selections will be saved on this device as you answer."}
          </div>
        </div>
      </Card>

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium leading-6 text-red-700" role="alert">
          {submitError}
        </div>
      )}

      {submitReviewOpen && (
        <Card className="border-amber-200 bg-amber-50 shadow-amber-100/70" padding="lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge variant="warning">Review before submit</Badge>
              <p className="mt-3 text-sm font-semibold leading-6 text-amber-950">{getSubmitWarningMessage()}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="button" variant="secondary" onClick={() => setSubmitReviewOpen(false)} disabled={submitting}>
                Continue answering
              </Button>
              <Button type="button" onClick={() => handleSubmit({ skipWarning: true })} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit anyway"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <QuestionCard
            disabled={submitting}
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionId={selectedAnswers[currentQuestion.id]}
            totalQuestions={totalQuestions}
            onSelectOption={handleSelectOption}
          />

          <Card className="flex flex-col gap-3 border-violet-100 shadow-violet-100/70 sm:flex-row sm:items-center sm:justify-between" padding="md">
            <Button
              type="button"
              onClick={goPrevious}
              disabled={currentIndex === 0 || submitting}
              variant="secondary"
            >
              Previous
            </Button>

            <div className="flex flex-col gap-3 sm:flex-row">
              {currentIndex < totalQuestions - 1 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={submitting}
                >
                  Next
                </Button>
              ) : null}
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={submitting}
                aria-busy={submitting}
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

import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { submitAttempt } from "../api/attemptApi.js";
import ErrorState from "../components/common/ErrorState.jsx";
import ProgressBar from "../components/quiz/ProgressBar.jsx";
import QuestionCard from "../components/quiz/QuestionCard.jsx";
import QuestionNavigator from "../components/quiz/QuestionNavigator.jsx";

export default function TakeQuizPage() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const attempt = location.state?.attempt;
  const questions = useMemo(() => attempt?.questions || [], [attempt]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  if (!attempt || String(attempt.attemptId) !== String(attemptId) || questions.length === 0) {
    return (
      <ErrorState
        title="Cannot load this attempt"
        message="Please start the quiz again."
        actionLabel="Back to quizzes"
        onAction={() => navigate("/quizzes")}
      />
    );
  }

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const totalQuestions = questions.length;

  function handleSelectOption(questionId, optionId) {
    setSelectedAnswers((answers) => ({
      ...answers,
      [questionId]: optionId,
    }));
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
      navigate(`/attempts/${attemptId}/result`);
    } catch (requestError) {
      setSubmitError(requestError.message || "Unable to submit this attempt.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Take quiz</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{attempt.quizTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Question {currentIndex + 1} of {totalQuestions}
              {attempt.timeLimitMinutes ? ` - ${attempt.timeLimitMinutes} minutes` : ""}
            </p>
          </div>
          <Link to="/quizzes" className="text-sm font-medium text-slate-500 hover:text-slate-800">
            Back to quizzes
          </Link>
        </div>
        <div className="mt-6">
          <ProgressBar value={answeredCount} max={totalQuestions} />
        </div>
      </section>

      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <QuestionCard
            question={currentQuestion}
            questionNumber={currentIndex + 1}
            selectedOptionId={selectedAnswers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <button
              type="button"
              onClick={goPrevious}
              disabled={currentIndex === 0}
              className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex gap-3">
              {currentIndex < totalQuestions - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800"
                >
                  Next
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-md bg-purple-700 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-purple-300"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>

        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          selectedAnswers={selectedAnswers}
          onSelectQuestion={setCurrentIndex}
        />
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import ScoreCard from "./ScoreCard.jsx";

export default function ResultSummary({ result }) {
  const skippedCount = (result.questions || []).filter((question) => question.selectedOptionId == null).length;
  const wrongCount =
    result.wrongCount ??
    Math.max(0, (result.totalQuestions || 0) - (result.correctCount || 0) - skippedCount);

  return (
    <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Attempt result</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950">{result.quizTitle}</h1>

          <dl className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Correct" value={result.correctCount ?? 0} />
            <Metric label="Wrong" value={wrongCount} />
            <Metric label="Total" value={result.totalQuestions ?? 0} />
            {skippedCount > 0 && <Metric label="Skipped" value={skippedCount} />}
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/attempts/${result.attemptId}/review`}
              className="rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
            >
              Review answers
            </Link>
            <Link
              to="/quizzes"
              className="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            >
              Back to quizzes
            </Link>
          </div>
        </div>

        <ScoreCard scorePercentage={result.scorePercentage} />
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-slate-950">{value}</dd>
    </div>
  );
}

import { Link } from "react-router-dom";

export default function AttemptHistoryItem({ attempt }) {
  const submitted = Boolean(attempt.submittedAt);
  const score = Number.isFinite(Number(attempt.scorePercentage)) ? Number(attempt.scorePercentage) : null;
  const submittedLabel = submitted ? formatDateTime(attempt.submittedAt) : "Not submitted yet";

  return (
    <article className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold text-slate-950">{attempt.quizTitle}</h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                submitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
              }`}
            >
              {submitted ? "Submitted" : "In progress"}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-4">
            <Metric label="Score" value={score == null ? "-" : `${score}%`} />
            <Metric label="Correct" value={attempt.correctCount ?? "-"} />
            <Metric label="Total" value={attempt.totalQuestions ?? "-"} />
            <Metric label="Submitted" value={submittedLabel} />
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          {submitted ? (
            <>
              <Link
                to={`/attempts/${attempt.attemptId}/result`}
                className="rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
              >
                View result
              </Link>
              <Link
                to={`/attempts/${attempt.attemptId}/review`}
                className="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200"
              >
                Review answers
              </Link>
            </>
          ) : (
            <span className="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
              Result unavailable
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

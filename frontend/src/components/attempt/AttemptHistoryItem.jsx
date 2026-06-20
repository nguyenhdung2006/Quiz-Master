import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function AttemptHistoryItem({ attempt }) {
  const submitted = Boolean(attempt.submittedAt);
  const score = Number.isFinite(Number(attempt.scorePercentage)) ? Number(attempt.scorePercentage) : null;
  const submittedLabel = submitted ? formatDateTime(attempt.submittedAt) : "Not submitted yet";

  return (
    <Card as="article" className="transition hover:-translate-y-0.5 hover:shadow-md" padding="lg">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={submitted ? "success" : "warning"}>{submitted ? "Submitted" : "In progress"}</Badge>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Attempt #{attempt.attemptId}
            </span>
          </div>
          <h2 className="mt-3 text-xl font-bold leading-7 text-slate-950">{attempt.quizTitle}</h2>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Score" tone="purple" value={score == null ? "-" : `${score}%`} />
            <Metric label="Correct" tone="success" value={attempt.correctCount ?? "-"} />
            <Metric label="Total" value={attempt.totalQuestions ?? "-"} />
            <Metric label="Submitted" value={submittedLabel} />
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
          {submitted ? (
            <>
              <Button as={Link} to={`/attempts/${attempt.attemptId}/result`}>
                View result
              </Button>
              <Button as={Link} to={`/attempts/${attempt.attemptId}/review`} variant="secondary">
                Review answers
              </Button>
            </>
          ) : (
            <span className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-500">
              Result unavailable
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, tone = "neutral", value }) {
  const toneClass = {
    neutral: "text-slate-950",
    purple: "text-purple-700",
    success: "text-emerald-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className={`mt-1 text-sm font-bold ${toneClass}`}>{value}</dd>
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

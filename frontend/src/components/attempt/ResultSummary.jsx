import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import ScoreCard from "./ScoreCard.jsx";

export default function ResultSummary({ result }) {
  const skippedCount = (result.questions || []).filter((question) => question.selectedOptionId == null).length;
  const wrongCount =
    result.wrongCount ??
    Math.max(0, (result.totalQuestions || 0) - (result.correctCount || 0) - skippedCount);
  const submittedLabel = formatDateTime(result.submittedAt);

  return (
    <Card as="article" className="overflow-hidden border-violet-100 shadow-violet-100/70" padding="none">
      <div className="border-b border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Badge variant="purple">Attempt result</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{result.quizTitle}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              Your submitted answers have been scored. Review each answer or return to your attempt history.
            </p>
          </div>
          <div className="rounded-2xl border border-violet-100 bg-white/80 px-4 py-3 text-sm shadow-sm shadow-violet-100/70">
            <p className="font-semibold text-slate-500">Submitted</p>
            <p className="mt-1 font-bold text-slate-950">{submittedLabel}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="p-6 sm:p-8">
          <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Correct" tone="success" value={result.correctCount ?? 0} />
            <Metric label="Wrong" tone="danger" value={wrongCount} />
            <Metric label="Skipped" tone="warning" value={skippedCount} />
            <Metric label="Total" value={result.totalQuestions ?? 0} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to={`/attempts/${result.attemptId}/review`}>
              Review answers
            </Button>
            <Button as={Link} to="/attempts" variant="secondary">
              My attempts
            </Button>
            <Button as={Link} to="/quizzes" variant="secondary">
              Back to quizzes
            </Button>
          </div>
        </div>

        <div className="p-6 pt-0 sm:p-8 lg:pl-0 lg:pt-8">
          <ScoreCard scorePercentage={result.scorePercentage} />
        </div>
      </div>
    </Card>
  );
}

function Metric({ label, tone = "neutral", value }) {
  const toneClass = {
    danger: "bg-red-50 text-red-700",
    neutral: "bg-slate-50 text-slate-950",
    success: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
  }[tone];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className={`mt-3 inline-flex rounded-xl px-3 py-1 text-2xl font-bold ${toneClass}`}>{value}</dd>
    </div>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

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

  return (
    <Card as="article" padding="xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <Badge variant="purple">Attempt result</Badge>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">{result.quizTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Your submitted answers have been scored. Review the breakdown below or open the answer review for details.
          </p>

          <dl className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Correct" tone="success" value={result.correctCount ?? 0} />
            <Metric label="Wrong" tone="danger" value={wrongCount} />
            <Metric label="Skipped" tone="warning" value={skippedCount} />
            <Metric label="Total" value={result.totalQuestions ?? 0} />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to={`/attempts/${result.attemptId}/review`}>
              Review answers
            </Button>
            <Button as={Link} to="/quizzes" variant="secondary">
              Back to quizzes
            </Button>
          </div>
        </div>

        <ScoreCard scorePercentage={result.scorePercentage} />
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

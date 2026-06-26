import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import ReviewOptionItem from "./ReviewOptionItem.jsx";

export default function ReviewQuestionCard({ question, questionNumber }) {
  const skipped = question.selectedOptionId == null;
  const status = skipped ? "Skipped" : question.correct ? "Correct" : "Wrong";
  const statusClass = skipped
    ? "neutral"
    : question.correct
      ? "success"
      : "danger";

  return (
    <Card as="article" className="border-violet-100 shadow-violet-100/70" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-violet-700">
            Question {questionNumber}
          </p>
          <h2 className="mt-3 text-xl font-bold leading-8 text-slate-950">{question.content}</h2>
        </div>
        <Badge variant={statusClass}>{status}</Badge>
      </div>

      {skipped && (
        <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          You did not select an answer for this question.
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {(question.options || []).map((option, index) => (
          <ReviewOptionItem key={option.id} label={String.fromCharCode(65 + index)} option={option} />
        ))}
      </ul>

      <div className="mt-5 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4">
        <p className="text-sm font-semibold text-violet-950">Explanation</p>
        <p className="mt-1 text-sm leading-6 text-violet-950/80">
          {question.explanation || "No explanation provided."}
        </p>
      </div>
    </Card>
  );
}

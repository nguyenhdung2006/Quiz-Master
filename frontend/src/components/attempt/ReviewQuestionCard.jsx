import ReviewOptionItem from "./ReviewOptionItem.jsx";

export default function ReviewQuestionCard({ question, questionNumber }) {
  const skipped = question.selectedOptionId == null;
  const status = skipped ? "Skipped" : question.correct ? "Correct" : "Wrong";
  const statusClass = skipped
    ? "bg-slate-100 text-slate-700"
    : question.correct
      ? "bg-emerald-100 text-emerald-800"
      : "bg-red-100 text-red-800";

  return (
    <article className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
            Question {questionNumber}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">{question.content}</h2>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>{status}</span>
      </div>

      {skipped && (
        <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No answer selected.
        </p>
      )}

      <ul className="mt-5 space-y-3">
        {(question.options || []).map((option) => (
          <ReviewOptionItem key={option.id} option={option} />
        ))}
      </ul>

      <div className="mt-5 rounded-lg bg-purple-50 px-4 py-3">
        <p className="text-sm font-semibold text-purple-900">Explanation</p>
        <p className="mt-1 text-sm leading-6 text-purple-900">
          {question.explanation || "No explanation provided."}
        </p>
      </div>
    </article>
  );
}

export default function QuestionList({
  confirmingDeleteId,
  deletingId,
  disabled,
  onCancelDelete,
  onConfirmDelete,
  onEdit,
  onRequestDelete,
  questions,
}) {
  const sortedQuestions = [...questions].sort((left, right) => left.displayOrder - right.displayOrder);

  if (sortedQuestions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
        <h3 className="text-lg font-semibold text-slate-950">No questions yet.</h3>
        <p className="mt-2 text-sm text-slate-500">Add at least one valid question before publishing.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedQuestions.map((question) => (
        <article key={question.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">
                Question {question.displayOrder}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{question.content}</h3>
              {question.explanation && (
                <p className="mt-2 text-sm leading-6 text-slate-500">{question.explanation}</p>
              )}
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              {confirmingDeleteId === question.id ? (
                <>
                  <button
                    type="button"
                    onClick={() => onConfirmDelete(question)}
                    disabled={deletingId === question.id}
                    data-testid={`confirm-delete-question-${question.id}`}
                    className="rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === question.id ? "Deleting..." : "Delete this question?"}
                  </button>
                  <button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={deletingId === question.id}
                    className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(question)}
                    disabled={disabled}
                    data-testid={`edit-question-${question.id}`}
                    className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRequestDelete(question)}
                    disabled={disabled}
                    data-testid={`delete-question-${question.id}`}
                    className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>

          <ul className="mt-5 space-y-2">
            {[...(question.options || [])]
              .sort((left, right) => left.displayOrder - right.displayOrder)
              .map((option) => (
                <li
                  key={option.id}
                  className={`rounded-md border px-3 py-2 text-sm ${
                    option.correct
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span>
                      {option.displayOrder}. {option.content}
                    </span>
                    {option.correct && (
                      <span className="shrink-0 text-xs font-semibold text-emerald-800">Correct</span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

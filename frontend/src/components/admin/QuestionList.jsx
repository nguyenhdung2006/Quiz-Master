import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

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
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
        <h3 className="text-lg font-semibold text-slate-950">No questions yet.</h3>
        <p className="mt-2 text-sm text-slate-500">Add at least one valid question before publishing.</p>
      </div>
    );
  }

  return (
    <Card className="lg:sticky lg:top-6" padding="none">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">Question list</h2>
        <p className="mt-1 text-sm text-slate-500">{sortedQuestions.length} questions in this quiz.</p>
      </div>

      <div className="max-h-none divide-y divide-slate-200 lg:max-h-[720px] lg:overflow-auto">
        {sortedQuestions.map((question) => (
          <article key={question.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="purple">Question {question.displayOrder}</Badge>
                  <Badge variant={question.options?.some((option) => option.correct) ? "success" : "danger"}>
                    {question.options?.length || 0} options
                  </Badge>
                </div>
                <h3 className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-slate-950">
                  {question.content}
                </h3>
                {question.explanation && (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{question.explanation}</p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {confirmingDeleteId === question.id ? (
                <>
                  <Button
                    type="button"
                    onClick={() => onConfirmDelete(question)}
                    disabled={deletingId === question.id}
                    data-testid={`confirm-delete-question-${question.id}`}
                    variant="danger"
                    size="sm"
                  >
                    {deletingId === question.id ? "Deleting..." : "Delete this question?"}
                  </Button>
                  <Button
                    type="button"
                    onClick={onCancelDelete}
                    disabled={deletingId === question.id}
                    variant="secondary"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    onClick={() => onEdit(question)}
                    disabled={disabled}
                    data-testid={`edit-question-${question.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    onClick={() => onRequestDelete(question)}
                    disabled={disabled}
                    data-testid={`delete-question-${question.id}`}
                    variant="ghost"
                    size="sm"
                    className="text-red-700 hover:bg-red-50"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>

            <ul className="mt-4 space-y-2">
              {[...(question.options || [])]
                .sort((left, right) => left.displayOrder - right.displayOrder)
                .map((option) => (
                  <li
                    key={option.id}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      option.correct
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span>
                        {option.displayOrder}. {option.content}
                      </span>
                      {option.correct && (
                        <span className="shrink-0 font-semibold text-emerald-800">Correct</span>
                      )}
                    </div>
                  </li>
                ))}
            </ul>
          </article>
        ))}
      </div>
    </Card>
  );
}

import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function AdminQuizList({ quizzes }) {
  return (
    <div className="grid gap-4">
      {quizzes.map((quiz) => (
        <Card
          key={quiz.id}
          as="article"
          className="overflow-hidden transition hover:border-violet-200 hover:shadow-md hover:shadow-violet-100/60"
          padding="none"
        >
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-semibold leading-7 text-slate-950">{quiz.title}</h2>
                  {quiz.description && (
                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{quiz.description}</p>
                  )}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Badge variant={quiz.published ? "success" : "warning"}>
                    {quiz.published ? "Published" : "Draft"}
                  </Badge>
                  {quiz.structuralEditingLocked && <Badge variant="purple">Structure locked</Badge>}
                </div>
              </div>

              <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Category" value={quiz.category?.name || "-"} />
                <Metric label="Questions" value={quiz.questionCount ?? "-"} />
                <Metric label="Time limit" value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "-"} />
                <Metric label="Created" value={formatDate(quiz.createdAt)} />
              </dl>
            </div>

            <div className="flex flex-col justify-between gap-4 border-t border-slate-200 bg-slate-50/80 p-5 lg:border-l lg:border-t-0">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {quiz.published ? "Visible in catalog" : "Hidden from catalog"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Edit details, questions, and publish status from the quiz editor.
                </p>
              </div>
              <Button as={Link} to={`/admin/quizzes/${quiz.id}/edit`} className="w-full">
                Edit
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <dt className="text-xs font-semibold text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(date);
}

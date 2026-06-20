import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function AdminQuizList({ quizzes }) {
  return (
    <div className="grid gap-4">
      {quizzes.map((quiz) => (
        <Card key={quiz.id} as="article" className="overflow-hidden" padding="none">
          <div className="grid gap-0 lg:grid-cols-[1fr_auto]">
            <div className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-semibold text-slate-950">{quiz.title}</h2>
                <Badge variant={quiz.published ? "success" : "warning"}>
                  {quiz.published ? "Published" : "Draft"}
                </Badge>
              </div>

              {quiz.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{quiz.description}</p>
              )}

              <dl className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric label="Category" value={quiz.category?.name || "-"} />
                <Metric label="Questions" value={quiz.questionCount ?? "-"} />
                <Metric label="Time limit" value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "-"} />
                <Metric label="Created" value={formatDate(quiz.createdAt)} />
              </dl>
            </div>

            <div className="flex items-center border-t border-slate-200 bg-slate-50 p-5 lg:border-l lg:border-t-0">
              <Button as={Link} to={`/admin/quizzes/${quiz.id}/edit`} className="w-full lg:w-auto">
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
    <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
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

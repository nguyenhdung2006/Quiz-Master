import { Link } from "react-router-dom";

export default function AdminQuizList({ quizzes }) {
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => (
        <article key={quiz.id} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-950">{quiz.title}</h2>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    quiz.published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}
                >
                  {quiz.published ? "Published" : "Draft"}
                </span>
              </div>

              {quiz.description && (
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">{quiz.description}</p>
              )}

              <dl className="mt-4 grid gap-3 sm:grid-cols-4">
                <Metric label="Category" value={quiz.category?.name || "-"} />
                <Metric label="Questions" value={quiz.questionCount ?? "-"} />
                <Metric label="Time limit" value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "-"} />
                <Metric label="Created" value={formatDate(quiz.createdAt)} />
              </dl>
            </div>

            <div className="flex shrink-0 flex-wrap gap-3">
              <Link
                to={`/admin/quizzes/${quiz.id}/edit`}
                className="rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800"
              >
                Edit
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
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

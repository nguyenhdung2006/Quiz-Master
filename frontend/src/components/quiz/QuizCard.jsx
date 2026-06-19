import { Link } from "react-router-dom";

export default function QuizCard({ quiz }) {
  return (
    <article className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700">
          {quiz.category?.name || "General"}
        </span>
        {quiz.timeLimitMinutes ? (
          <span className="text-xs font-medium text-slate-500">{quiz.timeLimitMinutes} min</span>
        ) : null}
      </div>

      <h2 className="mt-4 text-xl font-semibold text-slate-950">{quiz.title}</h2>
      {quiz.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{quiz.description}</p>}

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-sm text-slate-500">
          {quiz.questionCount ?? 0} {quiz.questionCount === 1 ? "question" : "questions"}
        </span>
        <Link
          to={`/quizzes/${quiz.id}`}
          className="rounded-md bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-800"
        >
          View quiz
        </Link>
      </div>
    </article>
  );
}

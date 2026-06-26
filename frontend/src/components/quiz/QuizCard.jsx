import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function QuizCard({ quiz }) {
  return (
    <Card
      as="article"
      className="group flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-md hover:shadow-violet-100"
      padding="none"
    >
      <div className="h-2 bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500" />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <Badge variant="purple">{quiz.category?.name || "General"}</Badge>
          {quiz.timeLimitMinutes ? (
            <Badge variant="neutral">{quiz.timeLimitMinutes} min</Badge>
          ) : null}
        </div>

        <h2 className="mt-4 text-xl font-bold leading-snug text-slate-950 transition group-hover:text-violet-900">
          {quiz.title}
        </h2>
        {quiz.description && <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{quiz.description}</p>}

        <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-3 sm:grid-cols-2">
          <Metadata label="Questions" value={quiz.questionCount ?? 0} />
          <Metadata label="Time limit" value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "None"} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <span className="text-sm font-medium text-slate-500">
            {quiz.questionCount ?? 0} {quiz.questionCount === 1 ? "question" : "questions"}
          </span>
          <Button as={Link} to={`/quizzes/${quiz.id}`} size="sm">
            View quiz
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Metadata({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

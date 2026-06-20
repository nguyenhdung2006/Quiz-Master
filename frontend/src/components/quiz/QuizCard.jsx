import { Link } from "react-router-dom";
import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function QuizCard({ quiz }) {
  return (
    <Card as="article" className="flex h-full flex-col transition hover:-translate-y-0.5 hover:shadow-md" padding="lg">
      <div className="flex items-start justify-between gap-3">
        <Badge variant="purple">{quiz.category?.name || "General"}</Badge>
        {quiz.timeLimitMinutes ? (
          <Badge variant="neutral">{quiz.timeLimitMinutes} min</Badge>
        ) : null}
      </div>

      <h2 className="mt-4 text-xl font-semibold text-slate-950">{quiz.title}</h2>
      {quiz.description && <p className="mt-2 line-clamp-3 text-sm text-slate-600">{quiz.description}</p>}

      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-5">
        <span className="text-sm text-slate-500">
          {quiz.questionCount ?? 0} {quiz.questionCount === 1 ? "question" : "questions"}
        </span>
        <Button as={Link} to={`/quizzes/${quiz.id}`} size="sm">
          View quiz
        </Button>
      </div>
    </Card>
  );
}

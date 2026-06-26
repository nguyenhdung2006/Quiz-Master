import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";
import ProgressBar from "./ProgressBar.jsx";

export default function QuestionNavigator({
  answeredCount,
  currentIndex,
  questions,
  quizTitle,
  selectedAnswers,
  timeLimitMinutes,
  totalQuestions,
  onSelectQuestion,
}) {
  return (
    <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
      <Card className="border-violet-100 shadow-violet-100/70" padding="lg">
        <p className="text-sm font-semibold text-violet-700">Quiz summary</p>
        <h2 className="mt-3 text-lg font-bold leading-7 text-slate-950">{quizTitle}</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <SummaryRow label="Current" value={`${currentIndex + 1}/${totalQuestions}`} />
          <SummaryRow label="Answered" value={`${answeredCount}/${totalQuestions}`} />
          {timeLimitMinutes ? <SummaryRow label="Time limit" value={`${timeLimitMinutes} min`} /> : null}
        </div>
      </Card>

      <Card className="border-violet-100 shadow-violet-100/70" padding="lg">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Progress</h2>
          <Badge variant={answeredCount === totalQuestions ? "success" : "purple"}>
            {answeredCount === totalQuestions ? "Complete" : "In progress"}
          </Badge>
        </div>
        <div className="mt-4">
          <ProgressBar value={answeredCount} max={totalQuestions} />
        </div>
      </Card>

      <Card className="border-violet-100 shadow-violet-100/70" padding="lg">
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-slate-900">Question navigation</h2>
          <div className="grid gap-2 text-xs font-medium text-slate-500 sm:grid-cols-3 lg:grid-cols-1">
            <Legend label="Current" className="bg-violet-700 text-white" />
            <Legend label="Answered" className="bg-violet-100 text-violet-800" />
            <Legend label="Unanswered" className="bg-slate-100 text-slate-600" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
          {questions.map((question, index) => {
            const answered = selectedAnswers[question.id] !== undefined;
            const active = index === currentIndex;

            return (
              <button
                type="button"
                key={question.id}
                onClick={() => onSelectQuestion(index)}
                aria-label={`Go to question ${index + 1}, ${active ? "current" : answered ? "answered" : "unanswered"}`}
                className={`h-11 rounded-2xl text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 ${
                  active
                    ? "bg-violet-700 text-white shadow-sm shadow-violet-200"
                    : answered
                      ? "bg-violet-100 text-violet-800 hover:bg-violet-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>
      </Card>
    </aside>
  );
}

function Legend({ className, label }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-5 w-5 rounded-lg ${className}`} />
      {label}
    </span>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

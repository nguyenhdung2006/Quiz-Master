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
      <Card padding="lg">
        <p className="text-sm font-semibold text-slate-900">Quiz summary</p>
        <h2 className="mt-3 text-lg font-bold leading-7 text-slate-950">{quizTitle}</h2>
        <div className="mt-4 grid gap-3 text-sm">
          <SummaryRow label="Current" value={`${currentIndex + 1}/${totalQuestions}`} />
          <SummaryRow label="Answered" value={`${answeredCount}/${totalQuestions}`} />
          {timeLimitMinutes ? <SummaryRow label="Time limit" value={`${timeLimitMinutes} min`} /> : null}
        </div>
      </Card>

      <Card padding="lg">
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

      <Card padding="lg">
        <h2 className="text-sm font-semibold text-slate-900">Question navigation</h2>
        <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
          {questions.map((question, index) => {
            const answered = selectedAnswers[question.id] !== undefined;
            const active = index === currentIndex;

            return (
              <button
                type="button"
                key={question.id}
                onClick={() => onSelectQuestion(index)}
                className={`h-11 rounded-full text-sm font-bold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-100 ${
                  active
                    ? "bg-purple-700 text-white shadow-sm"
                    : answered
                      ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
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

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

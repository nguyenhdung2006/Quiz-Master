export default function QuestionNavigator({ questions, currentIndex, selectedAnswers, onSelectQuestion }) {
  return (
    <aside className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-sm font-semibold text-slate-900">Questions</h2>
      <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
        {questions.map((question, index) => {
          const answered = selectedAnswers[question.id] !== undefined;
          const active = index === currentIndex;

          return (
            <button
              type="button"
              key={question.id}
              onClick={() => onSelectQuestion(index)}
              className={`h-10 rounded-md text-sm font-semibold transition ${
                active
                  ? "bg-purple-700 text-white"
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
    </aside>
  );
}

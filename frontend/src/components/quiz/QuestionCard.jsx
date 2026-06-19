import OptionItem from "./OptionItem.jsx";

export default function QuestionCard({ question, questionNumber, selectedOptionId, onSelectOption }) {
  return (
    <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Question {questionNumber}</p>
      <h2 className="mt-3 text-2xl font-semibold text-slate-950">{question.content}</h2>

      <div className="mt-6 space-y-3">
        {(question.options || []).map((option) => (
          <OptionItem
            key={option.id}
            option={option}
            selected={selectedOptionId === option.id}
            onSelect={() => onSelectOption(question.id, option.id)}
          />
        ))}
      </div>
    </section>
  );
}

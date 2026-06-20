import Card from "../ui/Card.jsx";
import OptionItem from "./OptionItem.jsx";

export default function QuestionCard({ question, questionNumber, selectedOptionId, onSelectOption }) {
  return (
    <Card className="min-h-[28rem]" padding="xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Question {questionNumber}</p>
      <h2 className="mt-4 text-2xl font-bold leading-9 text-slate-950">{question.content}</h2>

      <div className="mt-8 space-y-3">
        {(question.options || []).map((option, index) => (
          <OptionItem
            key={option.id}
            label={String.fromCharCode(65 + index)}
            option={option}
            selected={selectedOptionId === option.id}
            onSelect={() => onSelectOption(question.id, option.id)}
          />
        ))}
      </div>
    </Card>
  );
}

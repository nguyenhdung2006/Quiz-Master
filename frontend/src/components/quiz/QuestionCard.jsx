import Card from "../ui/Card.jsx";
import OptionItem from "./OptionItem.jsx";

export default function QuestionCard({
  disabled = false,
  question,
  questionNumber,
  selectedOptionId,
  totalQuestions,
  onSelectOption,
}) {
  const options = question.options || [];

  return (
    <Card className="min-h-[28rem] border-violet-100 shadow-violet-100/70" padding="xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-violet-700">
            Question {questionNumber}
            {totalQuestions ? ` of ${totalQuestions}` : ""}
          </p>
          <h2 className="mt-3 text-2xl font-bold leading-9 text-slate-950">{question.content}</h2>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {options.length} options
        </span>
      </div>

      <div className="mt-8 space-y-3">
        {options.map((option, index) => (
          <OptionItem
            key={option.id}
            disabled={disabled}
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

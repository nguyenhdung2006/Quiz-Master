export default function ReviewOptionItem({ option }) {
  const stateClass = option.correct
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : option.selected
      ? "border-red-300 bg-red-50 text-red-900"
      : "border-slate-200 bg-white text-slate-700";
  const label = option.correct && option.selected
    ? "Your correct answer"
    : option.correct
      ? "Correct answer"
      : option.selected
        ? "Your answer"
        : "";

  return (
    <li className={`rounded-lg border px-4 py-3 text-sm ${stateClass}`}>
      <div className="flex items-start justify-between gap-3">
        <span>{option.content}</span>
        <span className="shrink-0 text-xs font-semibold">{label}</span>
      </div>
    </li>
  );
}

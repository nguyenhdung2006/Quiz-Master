export default function ReviewOptionItem({ label, option }) {
  const stateClass = option.correct
    ? "border-emerald-300 bg-emerald-50 text-emerald-900"
    : option.selected
      ? "border-red-300 bg-red-50 text-red-900"
      : "border-slate-200 bg-white text-slate-700";
  const markerClass = option.correct
    ? "bg-emerald-100 text-emerald-800"
    : option.selected
      ? "bg-red-100 text-red-800"
      : "bg-slate-100 text-slate-600";
  const statusLabel = option.correct && option.selected
    ? "Your correct answer"
    : option.correct
      ? "Correct answer"
      : option.selected
        ? "Your answer"
        : "";

  return (
    <li className={`rounded-2xl border px-4 py-3 text-sm ${stateClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${markerClass}`}>
            {label}
          </span>
          <span className="min-w-0 font-medium leading-6">{option.content}</span>
        </div>
        {statusLabel && <span className="shrink-0 text-xs font-bold">{statusLabel}</span>}
      </div>
    </li>
  );
}

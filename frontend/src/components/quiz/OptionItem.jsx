export default function OptionItem({ disabled = false, label, option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={`group w-full rounded-2xl border px-4 py-4 text-left text-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-75 ${
        selected
          ? "border-violet-600 bg-violet-50 text-violet-950 shadow-sm ring-2 ring-violet-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-violet-300 hover:bg-violet-50 disabled:hover:border-slate-200 disabled:hover:bg-white"
      }`}
    >
      <span className="flex items-center gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition ${
            selected
              ? "bg-violet-700 text-white"
              : "bg-violet-50 text-violet-700 group-hover:bg-violet-100 group-disabled:bg-slate-100 group-disabled:text-slate-500"
          }`}
        >
          {label}
        </span>
        <span className="min-w-0 flex-1 break-words text-base font-medium leading-6">{option.content}</span>
        {selected && (
          <span className="shrink-0 rounded-full bg-violet-700 px-2.5 py-1 text-xs font-semibold text-white">
            Selected
          </span>
        )}
      </span>
    </button>
  );
}

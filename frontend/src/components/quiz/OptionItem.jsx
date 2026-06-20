export default function OptionItem({ label, option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group w-full rounded-2xl border px-4 py-4 text-left text-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-100 ${
        selected
          ? "border-purple-600 bg-purple-50 text-purple-950 shadow-sm ring-2 ring-purple-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50"
      }`}
    >
      <span className="flex items-center gap-4">
        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
            selected
              ? "bg-purple-700 text-white"
              : "bg-purple-50 text-purple-700 group-hover:bg-purple-100"
          }`}
        >
          {label}
        </span>
        <span className="min-w-0 flex-1 text-base font-medium leading-6">{option.content}</span>
        {selected && (
          <span className="rounded-full bg-purple-700 px-2.5 py-1 text-xs font-semibold text-white">
            Selected
          </span>
        )}
      </span>
    </button>
  );
}

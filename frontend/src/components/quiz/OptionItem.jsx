export default function OptionItem({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
        selected
          ? "border-purple-600 bg-purple-50 text-purple-950 ring-2 ring-purple-100"
          : "border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50"
      }`}
    >
      <span className="flex items-center gap-3">
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            selected ? "border-purple-700 bg-purple-700" : "border-slate-300"
          }`}
        >
          {selected && <span className="h-2 w-2 rounded-full bg-white" />}
        </span>
        <span>{option.content}</span>
      </span>
    </button>
  );
}

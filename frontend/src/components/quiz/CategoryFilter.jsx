export default function CategoryFilter({ categories, selectedCategoryId, disabled, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("")}
        className={`rounded-md px-3 py-2 text-sm font-medium transition ${
          selectedCategoryId === ""
            ? "bg-purple-700 text-white"
            : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category.id}
          disabled={disabled}
          onClick={() => onChange(String(category.id))}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            selectedCategoryId === String(category.id)
              ? "bg-purple-700 text-white"
              : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

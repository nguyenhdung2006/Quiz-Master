import { classNames } from "../ui/classNames.js";

export default function CategoryFilter({ categories, selectedCategoryId, disabled, onChange }) {
  const buttonClass = (active) =>
    classNames(
      "rounded-full px-3.5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
      active
        ? "bg-purple-700 text-white shadow-sm"
        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-purple-50 hover:text-purple-800 hover:ring-purple-200",
    );

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange("")}
        className={buttonClass(selectedCategoryId === "")}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          type="button"
          key={category.id}
          disabled={disabled}
          onClick={() => onChange(String(category.id))}
          className={buttonClass(selectedCategoryId === String(category.id))}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}

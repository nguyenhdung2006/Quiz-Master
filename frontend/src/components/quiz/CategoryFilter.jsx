import { classNames } from "../ui/classNames.js";

export default function CategoryFilter({ categories, selectedCategoryId, disabled, onChange }) {
  const buttonClass = (active) =>
    classNames(
      "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60",
      active
        ? "bg-gradient-to-b from-violet-600 to-indigo-700 text-white shadow-sm shadow-violet-200"
        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-violet-50 hover:text-violet-800 hover:ring-violet-200",
    );

  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 py-1 sm:mx-0 sm:flex-wrap sm:px-0">
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

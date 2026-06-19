import { useEffect, useState } from "react";

const emptyValues = {
  name: "",
  slug: "",
};

export default function CategoryForm({ editingCategory, busy, error, onCancelEdit, onSubmit }) {
  const [values, setValues] = useState(emptyValues);

  useEffect(() => {
    if (editingCategory) {
      setValues({
        name: editingCategory.name || "",
        slug: editingCategory.slug || "",
      });
      return;
    }

    setValues(emptyValues);
  }, [editingCategory]);

  function handleNameChange(event) {
    const name = event.target.value;
    setValues((current) => ({
      ...current,
      name,
      slug: current.slug ? current.slug : toSlug(name),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit({
      name: values.name.trim(),
      slug: values.slug.trim(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          {editingCategory ? "Edit category" : "Create category"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Use a readable name and a lowercase URL slug.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            type="text"
            value={values.name}
            onChange={handleNameChange}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            placeholder="Software Engineering"
            disabled={busy}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Slug</span>
          <input
            type="text"
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            placeholder="software-engineering"
            disabled={busy}
          />
        </label>
      </div>

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={busy || !values.name.trim() || !values.slug.trim()}
          className="rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {busy ? "Saving..." : editingCategory ? "Save category" : "Create category"}
        </button>

        {editingCategory && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={busy}
            className="rounded-md bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

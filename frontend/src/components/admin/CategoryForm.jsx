import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import { Input } from "../ui/FormControls.jsx";

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
    <Card as="form" onSubmit={handleSubmit} className="overflow-hidden xl:sticky xl:top-6" padding="none">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 to-white px-5 py-5">
        <h2 className="text-lg font-semibold text-slate-950">
          {editingCategory ? "Edit category" : "Create category"}
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Use a readable name and a unique lowercase URL slug.
        </p>
      </div>

      <div className="p-5">
        <div className="grid gap-4">
          <Input
            type="text"
            value={values.name}
            onChange={handleNameChange}
            label="Name"
            message="Required. Shown in catalog filters and quiz metadata."
            placeholder="Software Engineering"
            disabled={busy}
          />

          <Input
            type="text"
            value={values.slug}
            onChange={(event) => setValues((current) => ({ ...current, slug: event.target.value }))}
            label="Slug"
            message="Must be unique. Used by the backend to identify the category."
            placeholder="software-engineering"
            disabled={busy}
          />
        </div>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium leading-6 text-red-700 ring-1 ring-red-100">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            type="submit"
            disabled={busy || !values.name.trim() || !values.slug.trim()}
            className="w-full sm:w-auto"
          >
            {busy ? "Saving..." : editingCategory ? "Save category" : "Create category"}
          </Button>

          {editingCategory && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancelEdit}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

function toSlug(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

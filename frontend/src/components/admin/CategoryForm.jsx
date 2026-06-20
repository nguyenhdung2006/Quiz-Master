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
    <Card as="form" onSubmit={handleSubmit} className="xl:sticky xl:top-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">
          {editingCategory ? "Edit category" : "Create category"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Use a readable name and a lowercase URL slug.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <Input
          type="text"
          value={values.name}
          onChange={handleNameChange}
          label="Name"
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

      {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mt-5 flex flex-wrap gap-3">
        <Button
          type="submit"
          disabled={busy || !values.name.trim() || !values.slug.trim()}
        >
          {busy ? "Saving..." : editingCategory ? "Save category" : "Create category"}
        </Button>

        {editingCategory && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelEdit}
            disabled={busy}
          >
            Cancel
          </Button>
        )}
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

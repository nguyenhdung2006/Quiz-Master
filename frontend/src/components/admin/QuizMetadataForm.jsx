import { useEffect, useState } from "react";

const emptyValues = {
  title: "",
  description: "",
  categoryId: "",
  timeLimitMinutes: "",
};

export default function QuizMetadataForm({
  categories,
  initialQuiz,
  saving,
  error,
  successMessage,
  onSubmit,
}) {
  const [values, setValues] = useState(emptyValues);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    if (!initialQuiz) {
      setValues(emptyValues);
      return;
    }

    setValues({
      title: initialQuiz.title || "",
      description: initialQuiz.description || "",
      categoryId: initialQuiz.category?.id ? String(initialQuiz.category.id) : "",
      timeLimitMinutes: initialQuiz.timeLimitMinutes ? String(initialQuiz.timeLimitMinutes) : "",
    });
  }, [initialQuiz]);

  function handleSubmit(event) {
    event.preventDefault();
    setClientError(null);

    if (!values.title.trim()) {
      setClientError("Title is required.");
      return;
    }

    if (!values.categoryId) {
      setClientError("Category is required.");
      return;
    }

    const timeLimit = values.timeLimitMinutes.trim();
    if (timeLimit && Number(timeLimit) <= 0) {
      setClientError("Time limit must be greater than 0.");
      return;
    }

    onSubmit({
      categoryId: Number(values.categoryId),
      title: values.title.trim(),
      description: values.description.trim() || null,
      timeLimitMinutes: timeLimit ? Number(timeLimit) : null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Quiz metadata</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define the title, category, description, and optional time limit.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            type="text"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            placeholder="Java Core Basics"
            disabled={saving}
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            className="mt-1 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            placeholder="Short summary shown in quiz lists."
            disabled={saving}
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={values.categoryId}
              onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              disabled={saving || categories.length === 0}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Time limit minutes</span>
            <input
              type="number"
              min="1"
              value={values.timeLimitMinutes}
              onChange={(event) => setValues((current) => ({ ...current, timeLimitMinutes: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              placeholder="15"
              disabled={saving}
            />
          </label>
        </div>
      </div>

      {(clientError || error) && (
        <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {clientError || error}
        </p>
      )}

      {successMessage && (
        <p className="mt-5 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {successMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={saving || categories.length === 0}
        className="mt-6 rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {saving ? "Saving..." : "Save quiz"}
      </button>
    </form>
  );
}

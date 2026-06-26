import { useEffect, useState } from "react";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import { Input, Select, Textarea } from "../ui/FormControls.jsx";

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
    <Card as="form" onSubmit={handleSubmit} className="overflow-hidden" padding="none">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 to-white px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-950">Quiz metadata</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Define the details learners see before starting an attempt.
        </p>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid gap-5">
          <Input
            type="text"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            label="Title"
            message="Required. Keep it short enough to scan in the public catalog."
            placeholder="Java Core Basics"
            disabled={saving}
          />

          <Textarea
            value={values.description}
            onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
            label="Description"
            message="Optional. This appears in quiz lists and detail pages."
            placeholder="Short summary shown in quiz lists."
            disabled={saving}
          />

          <div className="grid gap-5 md:grid-cols-2">
            <Select
              value={values.categoryId}
              onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
              label="Category"
              message="Required before saving or publishing."
              disabled={saving || categories.length === 0}
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Input
              type="number"
              min="1"
              value={values.timeLimitMinutes}
              onChange={(event) => setValues((current) => ({ ...current, timeLimitMinutes: event.target.value }))}
              label="Time limit minutes"
              message="Optional. Leave blank for no displayed time limit."
              placeholder="15"
              disabled={saving}
            />
          </div>
        </div>

        {(clientError || error) && (
          <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium leading-6 text-red-700 ring-1 ring-red-100">
            {clientError || error}
          </p>
        )}

        {successMessage && (
          <p className="mt-5 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-100">
            {successMessage}
          </p>
        )}

        <Button
          type="submit"
          disabled={saving || categories.length === 0}
          className="mt-6 w-full sm:w-auto"
        >
          {saving ? "Saving..." : "Save quiz"}
        </Button>
      </div>
    </Card>
  );
}

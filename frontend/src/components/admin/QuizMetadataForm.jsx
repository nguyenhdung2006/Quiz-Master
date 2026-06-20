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
    <Card as="form" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold text-slate-950">Quiz metadata</h2>
        <p className="mt-1 text-sm text-slate-500">
          Define the title, category, description, and optional time limit.
        </p>
      </div>

      <div className="mt-6 grid gap-5">
        <Input
          type="text"
          value={values.title}
          onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
          label="Title"
          placeholder="Java Core Basics"
          disabled={saving}
        />

        <Textarea
          value={values.description}
          onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
          label="Description"
          placeholder="Short summary shown in quiz lists."
          disabled={saving}
        />

        <div className="grid gap-5 md:grid-cols-2">
          <Select
            value={values.categoryId}
            onChange={(event) => setValues((current) => ({ ...current, categoryId: event.target.value }))}
            label="Category"
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
            placeholder="15"
            disabled={saving}
          />
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

      <Button
        type="submit"
        disabled={saving || categories.length === 0}
        className="mt-6"
      >
        {saving ? "Saving..." : "Save quiz"}
      </Button>
    </Card>
  );
}

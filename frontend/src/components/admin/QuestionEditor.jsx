import { useEffect, useMemo, useState } from "react";

function defaultOptions() {
  return [
    { content: "", correct: true, displayOrder: "1" },
    { content: "", correct: false, displayOrder: "2" },
  ];
}

function emptyQuestion(displayOrder) {
  return {
    content: "",
    explanation: "",
    displayOrder: String(displayOrder),
    options: defaultOptions(),
  };
}

export default function QuestionEditor({
  defaultDisplayOrder,
  disabled,
  editingQuestion,
  error,
  saving,
  onCancelEdit,
  onSubmit,
}) {
  const initialValues = useMemo(
    () => toFormValues(editingQuestion, defaultDisplayOrder),
    [defaultDisplayOrder, editingQuestion],
  );
  const [values, setValues] = useState(initialValues);
  const [clientError, setClientError] = useState(null);

  useEffect(() => {
    setValues(initialValues);
    setClientError(null);
  }, [initialValues]);

  function updateOption(index, patch) {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? { ...option, ...patch } : option,
      ),
    }));
  }

  function setCorrectOption(index) {
    setValues((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => ({
        ...option,
        correct: optionIndex === index,
      })),
    }));
  }

  function addOption() {
    setValues((current) => ({
      ...current,
      options: [
        ...current.options,
        {
          content: "",
          correct: false,
          displayOrder: String(current.options.length + 1),
        },
      ],
    }));
  }

  function removeOption(index) {
    setValues((current) => {
      if (current.options.length <= 2) {
        return current;
      }

      const removedOption = current.options[index];
      const remainingOptions = current.options.filter((_, optionIndex) => optionIndex !== index);
      const normalizedOptions = remainingOptions.map((option, optionIndex) => ({
        ...option,
        correct: removedOption.correct ? optionIndex === 0 : option.correct,
      }));

      if (!normalizedOptions.some((option) => option.correct)) {
        normalizedOptions[0] = { ...normalizedOptions[0], correct: true };
      }

      return {
        ...current,
        options: normalizedOptions,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setClientError(null);

    const validationError = validateQuestion(values);
    if (validationError) {
      setClientError(validationError);
      return;
    }

    onSubmit({
      content: values.content.trim(),
      explanation: values.explanation.trim() || null,
      displayOrder: Number(values.displayOrder),
      options: values.options.map((option) => ({
        content: option.content.trim(),
        correct: Boolean(option.correct),
        displayOrder: Number(option.displayOrder),
      })),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">
            {editingQuestion ? `Editing question #${editingQuestion.displayOrder}` : "Add question"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Use one correct answer. Multiple correct answers are not supported in the MVP.
          </p>
        </div>
        {editingQuestion && (
          <button
            type="button"
            onClick={onCancelEdit}
            disabled={saving}
            className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel edit
          </button>
        )}
      </div>

      {disabled && (
        <p className="mt-5 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          This quiz is published. Unpublish it before editing questions.
        </p>
      )}

      <div className="mt-6 grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Question content</span>
          <textarea
            value={values.content}
            onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
            className="mt-1 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
            disabled={disabled || saving}
            placeholder="What is JVM?"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-[1fr_160px]">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Explanation</span>
            <textarea
              value={values.explanation}
              onChange={(event) => setValues((current) => ({ ...current, explanation: event.target.value }))}
              className="mt-1 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              disabled={disabled || saving}
              placeholder="JVM runs Java bytecode."
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Display order</span>
            <input
              type="number"
              min="1"
              value={values.displayOrder}
              onChange={(event) => setValues((current) => ({ ...current, displayOrder: event.target.value }))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
              disabled={disabled || saving}
            />
          </label>
        </div>

        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-sm font-semibold text-slate-800">Options</h3>
            <button
              type="button"
              onClick={addOption}
              disabled={disabled || saving}
              className="rounded-md bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Add option
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {values.options.map((option, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 md:grid-cols-[auto_1fr_120px_auto]"
              >
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="radio"
                    name="correct-option"
                    checked={option.correct}
                    onChange={() => setCorrectOption(index)}
                    disabled={disabled || saving}
                    className="h-4 w-4 accent-purple-700"
                  />
                  Correct
                </label>

                <input
                  type="text"
                  value={option.content}
                  onChange={(event) => updateOption(index, { content: event.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  placeholder={`Option ${index + 1}`}
                  disabled={disabled || saving}
                />

                <input
                  type="number"
                  min="1"
                  value={option.displayOrder}
                  onChange={(event) => updateOption(index, { displayOrder: event.target.value })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100"
                  disabled={disabled || saving}
                  aria-label={`Option ${index + 1} display order`}
                />

                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={disabled || saving || values.options.length <= 2}
                  className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {(clientError || error) && (
        <p className="mt-5 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {clientError || error}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled || saving}
        className="mt-6 rounded-md bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {saving ? "Saving..." : editingQuestion ? "Save changes" : "Add question"}
      </button>
    </form>
  );
}

function toFormValues(question, defaultDisplayOrder) {
  if (!question) {
    return emptyQuestion(defaultDisplayOrder);
  }

  const options = (question.options || []).map((option) => ({
    content: option.content || "",
    correct: Boolean(option.correct),
    displayOrder: String(option.displayOrder || ""),
  }));

  return {
    content: question.content || "",
    explanation: question.explanation || "",
    displayOrder: String(question.displayOrder || defaultDisplayOrder),
    options: options.length >= 2 ? options : defaultOptions(),
  };
}

function validateQuestion(values) {
  if (!values.content.trim()) {
    return "Question content is required.";
  }

  if (!isPositiveInteger(values.displayOrder)) {
    return "Question display order must be greater than 0.";
  }

  if (values.options.length < 2) {
    return "Each question must have at least two options.";
  }

  const correctCount = values.options.filter((option) => option.correct).length;
  if (correctCount !== 1) {
    return "Each question must have exactly one correct option.";
  }

  for (const option of values.options) {
    if (!option.content.trim()) {
      return "Option content is required.";
    }

    if (!isPositiveInteger(option.displayOrder)) {
      return "Option display order must be greater than 0.";
    }
  }

  const displayOrders = new Set(values.options.map((option) => Number(option.displayOrder)));
  if (displayOrders.size !== values.options.length) {
    return "Option display order must be unique within a question.";
  }

  return null;
}

function isPositiveInteger(value) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0;
}

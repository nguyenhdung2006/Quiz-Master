import { useEffect, useMemo, useState } from "react";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";
import { Input, Textarea } from "../ui/FormControls.jsx";
import { classNames } from "../ui/classNames.js";

const optionLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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
    <Card as="form" onSubmit={handleSubmit}>
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
          <Button
            type="button"
            variant="secondary"
            onClick={onCancelEdit}
            disabled={saving}
          >
            Cancel edit
          </Button>
        )}
      </div>

      {disabled && (
        <p className="mt-5 rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 ring-1 ring-amber-100">
          This quiz is published. Unpublish it before editing questions.
        </p>
      )}

      <div className="mt-6 grid gap-5">
        <Textarea
          value={values.content}
          onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
          label="Question content"
          className="min-h-24"
          disabled={disabled || saving}
          placeholder="What is JVM?"
        />

        <div className="grid gap-5 md:grid-cols-[1fr_160px]">
          <Textarea
            value={values.explanation}
            onChange={(event) => setValues((current) => ({ ...current, explanation: event.target.value }))}
            label="Explanation"
            className="min-h-20"
            disabled={disabled || saving}
            placeholder="JVM runs Java bytecode."
          />

          <Input
            type="number"
            min="1"
            value={values.displayOrder}
            onChange={(event) => setValues((current) => ({ ...current, displayOrder: event.target.value }))}
            label="Display order"
            disabled={disabled || saving}
          />
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Answer options</h3>
              <p className="mt-1 text-xs text-slate-500">Single-choice only. Exactly one option must be correct.</p>
            </div>
            <Button
              type="button"
              onClick={addOption}
              disabled={disabled || saving}
              variant="secondary"
              size="sm"
            >
              Add option
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {values.options.map((option, index) => (
              <div
                key={index}
                className={classNames(
                  "grid gap-3 rounded-xl border bg-white p-3 transition md:grid-cols-[auto_minmax(0,1fr)_110px_auto]",
                  option.correct ? "border-emerald-200 ring-2 ring-emerald-50" : "border-slate-200",
                )}
              >
                <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
                  <span
                    className={classNames(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                      option.correct ? "bg-emerald-100 text-emerald-700" : "bg-purple-50 text-purple-700",
                    )}
                  >
                    {optionLetters[index] || index + 1}
                  </span>
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

                <Input
                  type="text"
                  value={option.content}
                  onChange={(event) => updateOption(index, { content: event.target.value })}
                  placeholder={`Option ${index + 1}`}
                  disabled={disabled || saving}
                />

                <Input
                  type="number"
                  min="1"
                  value={option.displayOrder}
                  onChange={(event) => updateOption(index, { displayOrder: event.target.value })}
                  disabled={disabled || saving}
                  aria-label={`Option ${index + 1} display order`}
                />

                <Button
                  type="button"
                  onClick={() => removeOption(index)}
                  disabled={disabled || saving || values.options.length <= 2}
                  variant="ghost"
                  size="sm"
                  className="text-red-700 hover:bg-red-50"
                >
                  Remove
                </Button>
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

      <Button
        type="submit"
        disabled={disabled || saving}
        className="mt-6"
      >
        {saving ? "Saving..." : editingQuestion ? "Save changes" : "Add question"}
      </Button>
    </Card>
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

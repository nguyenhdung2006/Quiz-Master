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
  disabledMessage,
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
    <Card as="form" onSubmit={handleSubmit} className="overflow-hidden" padding="none">
      <div className="border-b border-slate-200 bg-gradient-to-r from-violet-50 to-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">
              {editingQuestion ? `Editing question #${editingQuestion.displayOrder}` : "Add question"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
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
      </div>

      <div className="p-5 sm:p-6">
        {disabled && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 ring-1 ring-amber-100">
            {disabledMessage || "This quiz is locked. Questions and options cannot be edited."}
          </p>
        )}

        <div className={classNames("grid gap-5", disabled ? "mt-5" : "")}>
          <Textarea
            value={values.content}
            onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
            label="Question content"
            message="Required. This is shown to learners during an attempt."
            className="min-h-28"
            disabled={disabled || saving}
            placeholder="What is JVM?"
          />

          <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
            <Textarea
              value={values.explanation}
              onChange={(event) => setValues((current) => ({ ...current, explanation: event.target.value }))}
              label="Explanation"
              message="Optional. Explanations appear only after an attempt is submitted."
              className="min-h-28"
              disabled={disabled || saving}
              placeholder="JVM runs Java bytecode."
            />

            <Input
              type="number"
              min="1"
              value={values.displayOrder}
              onChange={(event) => setValues((current) => ({ ...current, displayOrder: event.target.value }))}
              label="Display order"
              message="Required."
              disabled={disabled || saving}
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-950">Answer options</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Exactly one option must be marked correct before saving.
                </p>
              </div>
              <Button
                type="button"
                onClick={addOption}
                disabled={disabled || saving}
                variant="secondary"
                size="sm"
                className="w-full sm:w-auto"
              >
                Add option
              </Button>
            </div>

            <div className="mt-4 space-y-3">
              {values.options.map((option, index) => (
                <div
                  key={index}
                  className={classNames(
                    "grid gap-3 rounded-2xl border bg-white p-3 transition md:grid-cols-[minmax(0,1fr)_120px_auto]",
                    option.correct ? "border-emerald-300 ring-2 ring-emerald-100" : "border-slate-200",
                  )}
                >
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={classNames(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-bold",
                          option.correct ? "bg-emerald-100 text-emerald-800" : "bg-violet-50 text-violet-700",
                        )}
                      >
                        {optionLetters[index] || index + 1}
                      </span>
                      <label className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={option.correct}
                          onChange={() => setCorrectOption(index)}
                          disabled={disabled || saving}
                          className="h-4 w-4 accent-emerald-600"
                        />
                        Correct answer
                      </label>
                    </div>

                    <Input
                      type="text"
                      value={option.content}
                      onChange={(event) => updateOption(index, { content: event.target.value })}
                      label={`Option ${optionLetters[index] || index + 1}`}
                      placeholder={`Option ${index + 1}`}
                      disabled={disabled || saving}
                    />
                  </div>

                  <Input
                    type="number"
                    min="1"
                    value={option.displayOrder}
                    onChange={(event) => updateOption(index, { displayOrder: event.target.value })}
                    disabled={disabled || saving}
                    label="Order"
                    aria-label={`Option ${index + 1} display order`}
                  />

                  <Button
                    type="button"
                    onClick={() => removeOption(index)}
                    disabled={disabled || saving || values.options.length <= 2}
                    variant="ghost"
                    size="sm"
                    className="h-fit text-red-700 hover:bg-red-50 md:self-end"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {(clientError || error) && (
          <p className="mt-5 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium leading-6 text-red-700 ring-1 ring-red-100">
            {clientError || error}
          </p>
        )}

        <Button
          type="submit"
          disabled={disabled || saving}
          className="mt-6 w-full sm:w-auto"
        >
          {saving ? "Saving..." : editingQuestion ? "Save changes" : "Add question"}
        </Button>
      </div>
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

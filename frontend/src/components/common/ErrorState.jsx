import Button from "../ui/Button.jsx";

export default function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800 shadow-sm">
      <h2 className="text-base font-semibold">{title}</h2>
      {message && <p className="mt-1 leading-6 text-red-700">{message}</p>}
      {onAction && (
        <Button
          type="button"
          onClick={onAction}
          className="mt-4"
          size="sm"
          variant="danger"
        >
          {actionLabel || "Try again"}
        </Button>
      )}
    </div>
  );
}

export default function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-6 text-sm text-red-800">
      <h2 className="font-semibold">{title}</h2>
      {message && <p className="mt-1 text-red-700">{message}</p>}
      {onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-800"
        >
          {actionLabel || "Try again"}
        </button>
      )}
    </div>
  );
}

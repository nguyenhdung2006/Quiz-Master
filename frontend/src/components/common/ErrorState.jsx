import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function ErrorState({ title = "Something went wrong", message, actionLabel, onAction }) {
  return (
    <Card className="border-red-200 bg-red-50/80 px-5 py-6 text-sm text-red-800 shadow-red-100/70" padding="none">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-red-700 ring-1 ring-red-100">
          !
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-semibold">{title}</h2>
          {message && <p className="mt-1 leading-6 text-red-700">{message}</p>}
        </div>
      </div>
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
    </Card>
  );
}

import Card from "../ui/Card.jsx";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="flex items-center gap-4 px-5 py-6" padding="none">
      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 ring-1 ring-violet-100">
        <span className="h-3 w-3 animate-pulse rounded-full bg-violet-600" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">Loading data</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
    </Card>
  );
}

import Card from "../ui/Card.jsx";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="flex items-center gap-4 px-5 py-6" padding="none">
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-50">
        <span className="h-3 w-3 animate-pulse rounded-full bg-purple-600" />
      </span>
      <div>
        <p className="text-sm font-semibold text-slate-900">Đang tải dữ liệu</p>
        <p className="mt-1 text-sm text-slate-500">{message}</p>
      </div>
    </Card>
  );
}

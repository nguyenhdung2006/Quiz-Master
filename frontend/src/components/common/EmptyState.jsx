import Card from "../ui/Card.jsx";

export default function EmptyState({ title, message }) {
  return (
    <Card className="border-dashed px-5 py-10 text-center" padding="none">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-xl font-bold text-purple-700">
        ?
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-900">{title}</h2>
      {message && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{message}</p>}
    </Card>
  );
}

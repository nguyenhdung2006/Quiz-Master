import Card from "../ui/Card.jsx";

export default function EmptyState({ title, message }) {
  return (
    <Card className="border-dashed px-5 py-10 text-center" padding="none">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {message && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{message}</p>}
    </Card>
  );
}

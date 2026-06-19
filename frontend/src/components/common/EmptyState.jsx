export default function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {message && <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">{message}</p>}
    </div>
  );
}

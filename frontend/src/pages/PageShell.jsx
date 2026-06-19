export default function PageShell({ title, eyebrow, children }) {
  return (
    <section className="space-y-4">
      {eyebrow && <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{eyebrow}</p>}
      <h1 className="text-3xl font-semibold text-slate-950">{title}</h1>
      <div className="max-w-3xl text-slate-600">{children}</div>
    </section>
  );
}

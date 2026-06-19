export default function PublishStatusCard({
  editing,
  error,
  message,
  onTogglePublish,
  publishing,
  quiz,
}) {
  const published = Boolean(quiz?.published);

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <h2 className="text-lg font-semibold text-slate-950">Status</h2>
      <div className="mt-4 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Publication</p>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
              published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
            }`}
          >
            {published ? "Published" : "Draft"}
          </span>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Question count</p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {editing ? quiz?.questionCount ?? 0 : 0}
          </p>
        </div>

        {published && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
            This quiz is published. Unpublish it before editing questions.
          </p>
        )}

        {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {editing && (
          <button
            type="button"
            onClick={onTogglePublish}
            disabled={publishing}
            className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${
              published ? "bg-slate-800 hover:bg-slate-900" : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            {publishing ? "Saving..." : published ? "Unpublish quiz" : "Publish quiz"}
          </button>
        )}

        <p className="text-sm leading-6 text-slate-500">
          Metadata can be saved separately from publish status.
        </p>
      </div>
    </section>
  );
}

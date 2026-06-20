import Badge from "../ui/Badge.jsx";
import Button from "../ui/Button.jsx";
import Card from "../ui/Card.jsx";

export default function PublishStatusCard({
  editing,
  error,
  message,
  onTogglePublish,
  publishing,
  quiz,
}) {
  const published = Boolean(quiz?.published);
  const questionCount = editing ? quiz?.questionCount ?? quiz?.questions?.length ?? 0 : 0;

  return (
    <Card className="lg:sticky lg:top-6" padding="md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">Publish status</h2>
          <p className="mt-1 text-sm text-slate-500">Control public visibility separately from content edits.</p>
        </div>
        <Badge variant={published ? "success" : "warning"}>{published ? "Published" : "Draft"}</Badge>
      </div>

      <div className="mt-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatusMetric label="Questions" value={questionCount} />
          <StatusMetric label="Visibility" value={published ? "Public" : "Hidden"} />
        </div>

        {published && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm leading-6 text-amber-800 ring-1 ring-amber-100">
            This quiz is published. Unpublish it before editing questions.
          </p>
        )}

        {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {editing && (
          <Button
            type="button"
            onClick={onTogglePublish}
            disabled={publishing}
            variant={published ? "secondary" : "primary"}
            className="w-full"
          >
            {publishing ? "Saving..." : published ? "Unpublish quiz" : "Publish quiz"}
          </Button>
        )}

        <p className="text-sm leading-6 text-slate-500">
          Metadata can be saved separately from publish status.
        </p>
      </div>
    </Card>
  );
}

function StatusMetric({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

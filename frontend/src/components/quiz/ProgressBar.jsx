export default function ProgressBar({ value, max }) {
  const percentage = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          Answered {value}/{max}
        </span>
        <span className="font-semibold text-purple-700">{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-purple-700 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

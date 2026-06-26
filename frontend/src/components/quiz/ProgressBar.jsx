export default function ProgressBar({ label = "Answered", value, max }) {
  const safeMax = Math.max(max || 0, 0);
  const safeValue = Math.min(Math.max(value || 0, 0), safeMax);
  const percentage = safeMax > 0 ? Math.round((safeValue / safeMax) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700">
          {label} {safeValue}/{safeMax}
        </span>
        <span className="font-semibold text-violet-700">{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default function ScoreCard({ scorePercentage }) {
  const score = Number.isFinite(Number(scorePercentage)) ? Number(scorePercentage) : 0;
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 44;
  const dashOffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="rounded-2xl border border-purple-100 bg-purple-50 p-6">
      <div className="relative mx-auto flex h-44 w-44 items-center justify-center rounded-full bg-white shadow-sm">
        <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="44" fill="none" stroke="rgb(226 232 240)" strokeWidth="9" />
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            stroke="rgb(109 40 217)"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            strokeWidth="9"
          />
        </svg>
        <div className="absolute text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Score</p>
          <p className="mt-1 text-4xl font-bold text-purple-800">{clampedScore}%</p>
        </div>
      </div>
      <p className="mt-5 text-center text-sm leading-6 text-purple-900">
        This score comes from the backend submission result.
      </p>
    </div>
  );
}

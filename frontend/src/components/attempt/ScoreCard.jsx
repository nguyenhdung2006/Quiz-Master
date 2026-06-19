export default function ScoreCard({ scorePercentage }) {
  const score = Number.isFinite(Number(scorePercentage)) ? Number(scorePercentage) : 0;
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="flex items-center gap-5 rounded-lg bg-purple-50 p-5">
      <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-8 ring-purple-200">
        <span className="text-3xl font-semibold text-purple-800">{clampedScore}%</span>
      </div>
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">Score</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          This score comes from the backend submission result.
        </p>
      </div>
    </div>
  );
}

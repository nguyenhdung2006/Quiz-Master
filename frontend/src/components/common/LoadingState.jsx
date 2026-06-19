export default function LoadingState({ message = "Loading..." }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-5 py-6 text-sm text-slate-500 shadow-sm">
      {message}
    </div>
  );
}

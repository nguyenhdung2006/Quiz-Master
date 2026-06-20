import Card from "../ui/Card.jsx";

export default function LoadingState({ message = "Loading..." }) {
  return (
    <Card className="flex items-center gap-3 px-5 py-6 text-sm text-slate-500" padding="none">
      <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
      {message}
    </Card>
  );
}

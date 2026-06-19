import AttemptHistoryItem from "./AttemptHistoryItem.jsx";

export default function AttemptHistoryList({ attempts }) {
  return (
    <div className="space-y-4">
      {attempts.map((attempt) => (
        <AttemptHistoryItem key={attempt.attemptId} attempt={attempt} />
      ))}
    </div>
  );
}

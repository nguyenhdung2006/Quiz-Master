import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";

const highlights = ["Practice quizzes", "Instant scoring", "Review answers", "Track attempts"];

export default function AuthShell({ children, description, eyebrow, footer, title }) {
  return (
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-purple-100 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="bg-purple-700 p-8 text-white lg:p-10">
        <Badge className="bg-white/15 text-white ring-white/20" variant="neutral">
          QuizMaster
        </Badge>
        <h2 className="mt-6 text-3xl font-bold tracking-tight">Focused quiz practice for steady learning.</h2>
        <p className="mt-4 text-sm leading-6 text-purple-100">
          Sign in to take quizzes, see your scores, and return to completed attempts for answer review.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          {highlights.map((item) => (
            <div key={item} className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold">
              {item}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex items-center justify-center bg-slate-50 p-5 sm:p-8 lg:p-10">
        <Card className="w-full max-w-md shadow-md" padding="xl">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold text-purple-700">{eyebrow}</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
            <p className="text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </Card>
      </div>
    </section>
  );
}

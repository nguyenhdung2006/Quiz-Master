import Badge from "../ui/Badge.jsx";
import Card from "../ui/Card.jsx";

const highlights = [
  "Browse public quizzes",
  "Take quizzes",
  "Instant result after submit",
  "Review explanations after submit",
  "Attempt history for logged-in users",
];

export default function AuthShell({ children, description, eyebrow, footer, title }) {
  return (
    <section className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/60 lg:grid-cols-[0.92fr_1.08fr]">
      <aside className="bg-gradient-to-br from-violet-700 via-indigo-700 to-violet-950 p-7 text-white sm:p-8 lg:p-10">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black text-violet-700 shadow-lg shadow-violet-950/20">
              ?
            </span>
            <div>
              <p className="text-lg font-black tracking-tight">QuizMaster</p>
              <p className="text-xs font-medium text-violet-100">Learning made measurable</p>
            </div>
          </div>

          <Badge className="mt-8 bg-white/15 text-white ring-white/20" variant="neutral">
            QuizMaster account
          </Badge>

          <h2 className="mt-5 max-w-sm text-3xl font-black tracking-tight sm:text-4xl">
            Focused quiz practice for steady learning.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-violet-100">
            Sign in to browse public quizzes, take quizzes, review explanations, and return to your attempt history.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {highlights.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-violet-950/10"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xs font-black text-white">
                  {index + 1}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-violet-50/60 p-5 sm:p-8 lg:p-10">
        <Card className="w-full max-w-md border-violet-100 shadow-lg shadow-violet-100/70" padding="xl">
          <div className="space-y-2 text-center">
            <p className="text-sm font-semibold text-violet-700">{eyebrow}</p>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">{title}</h1>
            <p className="text-sm leading-6 text-slate-500">{description}</p>
          </div>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </Card>
      </div>
    </section>
  );
}

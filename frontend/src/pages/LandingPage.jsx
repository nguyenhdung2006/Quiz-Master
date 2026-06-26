import { Link } from "react-router-dom";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

const features = [
  {
    title: "Browse public quizzes",
    text: "Explore published quizzes by subject before signing in.",
  },
  {
    title: "Practice with a real quiz flow",
    text: "Start an attempt, answer questions, and submit when you are ready.",
  },
  {
    title: "Review after submit",
    text: "See your result and review explanations only after the attempt is submitted.",
  },
  {
    title: "Return to attempt history",
    text: "Signed-in users can revisit previous attempts from the history page.",
  },
];

export default function LandingPage() {
  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm shadow-violet-100/70">
        <div className="grid gap-8 p-6 md:grid-cols-[1.15fr_0.85fr] md:p-8 lg:p-10">
          <div className="flex flex-col justify-center">
            <Badge variant="purple">QuizMaster public practice</Badge>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
              Practice quizzes, submit confidently, review with clarity.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
              QuizMaster keeps the public experience focused: browse published quizzes,
              start a real attempt when signed in, and review answers only after submission.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button as={Link} to="/quizzes" size="lg">
                Browse quizzes
              </Button>
              <Button as={Link} to="/register" size="lg" variant="secondary">
                Create account
              </Button>
            </div>
          </div>

          <div className="relative rounded-3xl bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-4 ring-1 ring-violet-100">
            <Card className="relative overflow-hidden shadow-md shadow-violet-100/70" padding="lg">
              <div className="flex items-start justify-between gap-3">
                <Badge variant="purple">Quiz flow</Badge>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                  Metadata only
                </span>
              </div>
              <h2 className="mt-5 text-2xl font-bold text-slate-950">Choose a quiz</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Public pages show title, category, question count, and time limit. Answers stay hidden.
              </p>
              <div className="mt-6 space-y-3">
                <FlowStep label="1" text="Browse catalog" />
                <FlowStep label="2" text="Start an attempt" />
                <FlowStep label="3" text="Submit and review" />
              </div>
            </Card>
          </div>
        </div>

        <div className="grid border-t border-violet-100 bg-violet-50/45 sm:grid-cols-3">
          <Capability label="Published catalog" />
          <Capability label="Protected attempts" />
          <Capability label="Post-submit review" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <InfoCard key={feature.title} title={feature.title} text={feature.text} />
        ))}
      </section>

      <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/70 md:p-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="purple">What stays private</Badge>
            <h2 className="mt-4 text-2xl font-bold text-slate-950 md:text-3xl">
              Public pages do not reveal answers.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Catalog and detail pages are intentionally limited to quiz metadata. Questions,
              correct options, and explanations belong to the authenticated attempt and review flow.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <SafetyCard title="Before submit" text="No correct answers or explanations on public pages." />
            <SafetyCard title="During attempt" text="Answer choices are shown without answer keys." />
            <SafetyCard title="After submit" text="Result and review become available to the owner." />
          </div>
        </div>
      </section>
    </div>
  );
}

function FlowStep({ label, text }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-800">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">{text}</span>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <Card as="article" className="transition hover:-translate-y-0.5 hover:shadow-md hover:shadow-violet-100" padding="lg">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Card>
  );
}

function SafetyCard({ title, text }) {
  return (
    <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4">
      <h3 className="text-sm font-bold text-violet-900">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-violet-900/75">{text}</p>
    </div>
  );
}

function Capability({ label }) {
  return (
    <div className="border-violet-100 px-5 py-4 text-sm font-semibold text-violet-900 sm:border-r sm:last:border-r-0">
      {label}
    </div>
  );
}

import { Link } from "react-router-dom";
import Badge from "../components/ui/Badge.jsx";
import Button from "../components/ui/Button.jsx";
import Card from "../components/ui/Card.jsx";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 overflow-hidden rounded-3xl border border-purple-100 bg-white p-6 shadow-sm md:grid-cols-[1.25fr_0.75fr] md:p-10">
        <div className="flex flex-col justify-center">
          <Badge variant="purple">QuizMaster learning platform</Badge>
          <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
            Practice focused quizzes and review every answer with clarity.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Build confidence across Java, Spring Boot, SQL, Networking, Software Engineering, English,
            and other subjects through a clean quiz flow built for steady self-study.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button as={Link} to="/quizzes" size="lg">
              Browse quizzes
            </Button>
            <Button as={Link} to="/register" size="lg" variant="secondary">
              Create account
            </Button>
          </div>
          <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            <Capability label="Take quiz" />
            <Capability label="Instant result" />
            <Capability label="Review answers" />
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-purple-100 via-white to-slate-100 p-4">
          <Card className="shadow-md" padding="lg">
            <p className="text-sm font-semibold text-purple-700">Quiz preview</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">Spring Boot Basics</h2>
            <div className="mt-5 space-y-3">
              <div className="h-3 rounded bg-purple-100" />
              <div className="h-3 w-10/12 rounded bg-slate-100" />
              <div className="h-3 w-8/12 rounded bg-slate-100" />
            </div>
            <div className="mt-6 rounded-xl bg-purple-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm">
              Ready when you are
            </div>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <InfoCard
          title="Practice quizzes"
          text="Move through focused sets of questions designed for self-learning and exam preparation."
        />
        <InfoCard
          title="Study technical topics"
          text="Explore programming, database, networking, and software engineering subjects from one catalog."
        />
        <InfoCard
          title="Review progress later"
          text="Signed-in users can return to previous attempts and review completed work."
        />
      </section>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <Card as="article" className="transition hover:-translate-y-0.5 hover:shadow-md" padding="lg">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </Card>
  );
}

function Capability({ label }) {
  return (
    <div className="rounded-xl border border-purple-100 bg-purple-50 px-3 py-2 text-center text-sm font-semibold text-purple-800">
      {label}
    </div>
  );
}

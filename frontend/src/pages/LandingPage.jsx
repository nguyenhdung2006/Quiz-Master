import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-8 rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200 md:grid-cols-[1.3fr_0.7fr] md:p-10">
        <div className="flex flex-col justify-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-purple-700">QuizMaster</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-slate-950 md:text-5xl">
            Practice focused quizzes for real learning momentum.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
            Build confidence across Java, Spring Boot, SQL, Networking, Software Engineering, English,
            and other subjects as the catalog grows.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              to="/quizzes"
              className="rounded-md bg-purple-700 px-5 py-3 text-sm font-semibold text-white hover:bg-purple-800"
            >
              Browse quizzes
            </Link>
            <Link
              to="/register"
              className="rounded-md bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-200"
            >
              Create account
            </Link>
          </div>
        </div>
        <div className="rounded-lg bg-purple-50 p-6">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Quiz preview</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950">Spring Boot Basics</h2>
            <div className="mt-5 space-y-3">
              <div className="h-3 rounded bg-purple-100" />
              <div className="h-3 w-10/12 rounded bg-slate-100" />
              <div className="h-3 w-8/12 rounded bg-slate-100" />
            </div>
            <div className="mt-6 rounded-md bg-purple-700 px-4 py-3 text-center text-sm font-semibold text-white">
              Ready when you are
            </div>
          </div>
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
          text="Signed-in users will be able to return to previous attempts and review completed work."
        />
      </section>
    </div>
  );
}

function InfoCard({ title, text }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </article>
  );
}

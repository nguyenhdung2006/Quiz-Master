import { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Button from "../components/ui/Button.jsx";
import { Input } from "../components/ui/FormControls.jsx";

function AuthAlert({ children, tone = "danger" }) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-red-200 bg-red-50 text-red-700";

  return (
    <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-medium leading-6 ${styles}`} role="alert">
      {children}
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);

  const from = location.state?.from?.pathname || "/quizzes";
  const successMessage = location.state?.message;

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed. Please try again.");
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      description="Use your email and password to continue your quiz progress."
      eyebrow="Welcome back"
      title="Log in to QuizMaster"
      footer={
        <p className="text-center text-sm text-slate-600">
          New to QuizMaster?{" "}
          <Link to="/register" className="font-semibold text-violet-700 transition hover:text-violet-800">
            Create an account
          </Link>
        </p>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

      {!error && successMessage && <AuthAlert tone="success">{successMessage}</AuthAlert>}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          disabled={submitting}
          placeholder="you@example.com"
        />

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <div className="flex rounded-xl border border-slate-200 bg-white shadow-sm transition hover:border-slate-300 focus-within:border-violet-500 focus-within:ring-4 focus-within:ring-violet-100">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={submitting}
              className="min-w-0 flex-1 rounded-l-xl px-3.5 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="Your password"
            />
            <button
              type="button"
              disabled={submitting}
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-r-xl px-3.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-violet-100 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          aria-busy={submitting}
          size="lg"
        >
          {submitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </AuthShell>
  );
}

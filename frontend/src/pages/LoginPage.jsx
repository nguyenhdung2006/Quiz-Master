import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Button from "../components/ui/Button.jsx";
import { Input } from "../components/ui/FormControls.jsx";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname || "/quizzes";
  const successMessage = location.state?.message;

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(requestError.message || "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      description="Use your email and password to continue."
      eyebrow="Welcome back"
      title="Login to QuizMaster"
      footer={
        <p className="text-center text-sm text-slate-600">
          New to QuizMaster?{" "}
          <Link to="/register" className="font-semibold text-purple-700 hover:text-purple-800">
            Create an account
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {!error && successMessage && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
          {successMessage}
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
        />

        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <div className="flex rounded-lg border border-slate-300 bg-white transition focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              className="min-w-0 flex-1 rounded-l-lg px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400"
              placeholder="Your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-r-lg px-3 text-sm font-semibold text-purple-700 transition hover:bg-purple-50"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Logging in..." : "Login"}
        </Button>
      </form>
    </AuthShell>
  );
}

import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Button from "../components/ui/Button.jsx";
import { Input } from "../components/ui/FormControls.jsx";

function AuthAlert({ children }) {
  return (
    <div
      className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium leading-6 text-red-700"
      role="alert"
    >
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const submitLockRef = useRef(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitLockRef.current) {
      return;
    }

    if (!email.trim() || !password || !confirmPassword) {
      setError("Email, password, and password confirmation are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);
    setError("");

    try {
      const response = await register({ email: email.trim(), password });
      navigate(response?.accessToken ? "/quizzes" : "/login", {
        replace: true,
        state: response?.accessToken ? undefined : { message: "Account created. Please log in." },
      });
    } catch (requestError) {
      setError(requestError.message || "Registration failed. Please try again.");
    } finally {
      submitLockRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      description="Register with email and password only, then start practicing."
      eyebrow="Start practicing"
      title="Create your account"
      footer={
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-violet-700 transition hover:text-violet-800">
            Login
          </Link>
        </p>
      }
    >
      {error && <AuthAlert>{error}</AuthAlert>}

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
              autoComplete="new-password"
              disabled={submitting}
              className="min-w-0 flex-1 rounded-l-xl px-3.5 py-2.5 text-sm text-slate-950 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
              placeholder="At least 8 characters"
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

        <Input
          type={showPassword ? "text" : "password"}
          label="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          disabled={submitting}
          placeholder="Repeat your password"
        />

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          aria-busy={submitting}
          size="lg"
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

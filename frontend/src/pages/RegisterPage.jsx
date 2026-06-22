import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import AuthShell from "../components/auth/AuthShell.jsx";
import Button from "../components/ui/Button.jsx";
import { Input } from "../components/ui/FormControls.jsx";

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
      description="Register with email and password only."
      eyebrow="Start practicing"
      title="Create your account"
      footer={
        <p className="text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-purple-700 hover:text-purple-800">
            Login
          </Link>
        </p>
      }
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
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
              autoComplete="new-password"
              className="min-w-0 flex-1 rounded-l-lg px-3 py-2.5 text-slate-950 outline-none placeholder:text-slate-400"
              placeholder="At least 8 characters"
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

        <Input
          type={showPassword ? "text" : "password"}
          label="Confirm password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          autoComplete="new-password"
          placeholder="Repeat your password"
        />

        <Button
          type="submit"
          disabled={submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </AuthShell>
  );
}

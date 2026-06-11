import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useLogin } from "../lib/auth";
import { ApiError } from "../lib/api";
import { Banner, Button, Field } from "../components/ui";

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/portal";
  const login = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    login.mutate(form, { onSuccess: () => navigate(next) });
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/daydrive-logo.svg" alt="DayDrive" className="h-10 w-auto mx-auto" />
          <h1 className="text-2xl font-display font-bold text-ink mt-4">Welcome back</h1>
          <p className="text-ink/55 text-sm">Log in to view your policies and documents</p>
        </div>

        <div className="bg-white border border-ink/8 rounded-2xl shadow-sm p-8 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              label="Email address"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Field
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />

            {login.isError && (
              <Banner tone="danger">
                {login.error instanceof ApiError ? login.error.message : "Couldn't log you in."}
              </Banner>
            )}

            <Button type="submit" disabled={login.isPending} className="w-full mt-2">
              {login.isPending ? "Logging in…" : "Log in →"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/50">
          Don't have an account?{" "}
          <Link to={`/signup?next=${encodeURIComponent(next)}`} className="text-mint-700 font-semibold hover:text-mint-600">
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

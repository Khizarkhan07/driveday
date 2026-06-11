import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useSignup } from "../lib/auth";
import { ApiError } from "../lib/api";
import { Banner, Button, Field } from "../components/ui";

export function SignupPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next") ?? "/portal";
  const signup = useSignup();
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    signup.mutate(form, { onSuccess: () => navigate(next) });
  }

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <img src="/daydrive-logo.svg" alt="DayDrive" className="h-10 w-auto mx-auto" />
          <h1 className="text-2xl font-display font-bold text-ink mt-4">Create your account</h1>
          <p className="text-ink/55 text-sm">Save your quotes and access policy documents</p>
        </div>

        <div className="bg-white border border-ink/8 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="First name"
                autoComplete="given-name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
              />
              <Field
                label="Last name"
                autoComplete="family-name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
              />
            </div>
            <Field
              label="Email address"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
            <Field
              label="Password (min 8 characters)"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />

            {signup.isError && (
              <Banner tone="danger">
                {signup.error instanceof ApiError ? signup.error.message : "Couldn't create your account."}
              </Banner>
            )}

            <Button type="submit" disabled={signup.isPending} className="w-full mt-2">
              {signup.isPending ? "Creating account…" : "Create account →"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-ink/50">
          Already have an account?{" "}
          <Link to={`/login?next=${encodeURIComponent(next)}`} className="text-mint-700 font-semibold hover:text-mint-600">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

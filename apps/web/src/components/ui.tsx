import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-ink-900 border border-ink-700/60 rounded-2xl shadow-xl shadow-black/30 p-6 sm:p-8 ${className}`}>
      {children}
    </div>
  );
}

export function Button({
  className = "",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-brand-400 text-ink-950 hover:bg-brand-300 active:scale-95 shadow-lg shadow-brand-400/20"
      : variant === "ghost"
      ? "text-ink-300 hover:text-white hover:bg-ink-800"
      : "bg-ink-800 border border-ink-700 text-white hover:bg-ink-700 active:scale-95";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function Field({ label, error, ...props }, ref) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink-400 uppercase tracking-wider mb-1.5">
        {label}
      </span>
      <input
        ref={ref}
        className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-3 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition"
        {...props}
      />
      {error ? <span className="block text-xs text-red-400 mt-1.5">{error}</span> : null}
    </label>
  );
});

export function Banner({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning" | "danger" | "success";
  children: ReactNode;
}) {
  const styles =
    tone === "danger"
      ? "bg-red-500/10 border-red-500/30 text-red-300"
      : tone === "warning"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
      : tone === "success"
      ? "bg-brand-400/10 border-brand-400/30 text-brand-300"
      : "bg-brand-400/10 border-brand-400/20 text-brand-200";
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>{children}</div>
  );
}

export function Stepper({ step, total }: { step: number; total: number }) {
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-1.5" aria-label={`Step ${step} of ${total}`}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < step - 1
                ? "bg-brand-400"
                : i === step - 1
                ? "bg-accent-500"
                : "bg-ink-800"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-ink-500">Step {step} of {total}</p>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const styles =
    tone === "success"
      ? "bg-brand-400/15 text-brand-400 border-brand-400/20"
      : tone === "warning"
      ? "bg-amber-400/15 text-amber-400 border-amber-400/20"
      : tone === "danger"
      ? "bg-red-400/15 text-red-400 border-red-400/20"
      : "bg-ink-700/50 text-ink-300 border-ink-700";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {children}
    </span>
  );
}

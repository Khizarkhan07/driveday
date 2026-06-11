import { forwardRef } from "react";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-ink/8 rounded-2xl shadow-sm p-6 sm:p-8 ${className}`}>
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
      ? "bg-mint text-ink hover:bg-mint-600 active:scale-95 shadow-lg shadow-mint/25"
      : variant === "ghost"
      ? "text-ink/60 hover:text-ink hover:bg-ink/5"
      : "bg-white border border-ink/15 text-ink hover:bg-ink/5 active:scale-95 shadow-sm";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export const Field = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function Field({ label, error, ...props }, ref) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1.5">
        {label}
      </span>
      <input
        ref={ref}
        className="w-full rounded-xl bg-white border border-ink/15 px-4 py-3 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint transition"
        {...props}
      />
      {error ? <span className="block text-xs text-red-500 mt-1.5">{error}</span> : null}
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
      ? "bg-red-50 border-red-200 text-red-700"
      : tone === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-700"
      : tone === "success"
      ? "bg-mint/10 border-mint/30 text-mint-700"
      : "bg-mint/10 border-mint/20 text-mint-700";
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
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i < step - 1
                ? "bg-mint"
                : i === step - 1
                ? "bg-mint-700"
                : "bg-ink/10"
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-ink/45">Step {step} of {total}</p>
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
      ? "bg-mint/15 text-mint-700 border-mint/25"
      : tone === "warning"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : tone === "danger"
      ? "bg-red-100 text-red-600 border-red-200"
      : "bg-ink/5 text-ink/60 border-ink/10";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {children}
    </span>
  );
}

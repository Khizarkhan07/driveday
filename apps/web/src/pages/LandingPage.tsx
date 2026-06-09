import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { ukRegistrationSchema, type VehicleLookupResult } from "@motorcover/shared-types";
import { api, ApiError } from "../lib/api";
import { useBuyFlowStore } from "../lib/buy-flow-store";

export function LandingPage() {
  const navigate = useNavigate();
  const setVehicle = useBuyFlowStore((s) => s.setVehicle);
  const reset = useBuyFlowStore((s) => s.reset);
  const [registration, setRegistration] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const lookup = useMutation({
    mutationFn: (reg: string) =>
      api.post<{ vehicle: VehicleLookupResult & { id: string } }>("/vehicle-lookup", {
        registration: reg,
      }),
    onSuccess: ({ vehicle }) => {
      reset();
      setVehicle(vehicle);
      navigate("/vehicle-confirm");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    const parsed = ukRegistrationSchema.safeParse(registration);
    if (!parsed.success) {
      setValidationError(parsed.error.issues[0]?.message ?? "Enter a valid registration");
      return;
    }
    lookup.mutate(parsed.data);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink-950">
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=2000&q=70"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/80 to-ink-950" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-400/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-accent-500/8 rounded-full blur-[100px]" />

      <div className="relative z-10">
        {/* Hero */}
        <div className="flex items-center px-6 sm:px-12 lg:px-20 py-16 min-h-[calc(100vh-65px)]">
          <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-brand-400/10 border border-brand-400/20 text-brand-400 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                Instant cover · No annual commitment
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-[1.1]">
                  One-day car<br />
                  insurance,{" "}
                  <span className="text-brand-400">instantly</span>
                </h1>
                <p className="text-ink-300 text-lg leading-relaxed max-w-md">
                  Need to borrow a car or drive a new one home? Get fully comprehensive 1-day cover in under 2 minutes. No hidden fees.
                </p>
              </div>

              {/* Trust signals */}
              <div className="flex flex-wrap gap-4 text-sm text-ink-400">
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>FCA authorised</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Highway Insurance underwriter</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-brand-400">✓</span>
                  <span>Instant documents</span>
                </div>
              </div>

            </div>

            {/* Right: quote box */}
            <div className="lg:max-w-sm w-full mx-auto lg:mx-0 lg:ml-auto">
              <div className="bg-ink-900/90 backdrop-blur border border-ink-700/60 rounded-2xl shadow-2xl shadow-black/50 p-8 space-y-6">
                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Step 1 of 5</p>
                  <h2 className="text-xl font-extrabold text-white">Enter your reg plate</h2>
                  <p className="text-sm text-ink-400 mt-1">We'll look up your vehicle instantly</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      name="registration"
                      placeholder="e.g. KE65TCJ"
                      value={registration}
                      onChange={(e) => setRegistration(e.target.value.toUpperCase())}
                      autoComplete="off"
                      maxLength={8}
                      className="w-full rounded-xl bg-white border-0 px-4 py-4 text-center text-2xl font-extrabold tracking-[0.2em] uppercase text-ink-950 placeholder:text-ink-300 placeholder:font-bold placeholder:tracking-widest focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-inner"
                    />
                    {validationError && (
                      <p className="text-xs text-red-400 mt-1.5 text-center">{validationError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={lookup.isPending}
                    className="w-full bg-brand-400 text-ink-950 font-extrabold text-base py-3.5 rounded-xl hover:bg-brand-300 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-brand-400/25"
                  >
                    {lookup.isPending ? "Looking up vehicle…" : "Get my instant quote →"}
                  </button>

                  {lookup.isError && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl px-4 py-3 text-sm">
                      {lookup.error instanceof ApiError
                        ? lookup.error.message
                        : "Something went wrong looking up that vehicle."}
                    </div>
                  )}
                </form>

                <div className="flex items-center justify-center gap-4 text-xs text-ink-600 pt-2 border-t border-ink-800">
                  <span>🔒 Secure</span>
                  <span>·</span>
                  <span>⚡ Instant</span>
                  <span>·</span>
                  <span>📄 Real documents</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

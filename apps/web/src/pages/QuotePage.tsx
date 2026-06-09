import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { type PricingBreakdown } from "@motorcover/shared-types";
import { api, ApiError } from "../lib/api";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { useCurrentUser } from "../lib/auth";
import { Banner, Button, Card, Stepper } from "../components/ui";

interface QuoteResponse {
  quote: {
    id: string;
    pricingBreakdown: PricingBreakdown;
    totalPence: number;
    durationDays: number;
    expiresAt: string;
  };
}

function money(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function QuotePage() {
  const navigate = useNavigate();
  const { vehicle, startDate, endDate, driver, quoteId, setQuoteId } = useBuyFlowStore();
  const { data: userData } = useCurrentUser();

  const createQuote = useMutation({
    mutationFn: () =>
      api.post<QuoteResponse>("/quote", { vehicleId: vehicle!.id, startDate, endDate, driver }),
    onSuccess: ({ quote }) => setQuoteId(quote.id),
  });

  const fetchQuote = useMutation({
    mutationFn: (id: string) => api.get<QuoteResponse>(`/quote/${id}`),
  });

  useEffect(() => {
    if (!vehicle || !startDate || !endDate || !driver) return;
    if (quoteId) fetchQuote.mutate(quoteId);
    else createQuote.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!vehicle || !startDate || !endDate || !driver) return <Navigate to="/" replace />;

  const result = fetchQuote.data ?? createQuote.data;
  const isLoading = createQuote.isPending || fetchQuote.isPending;
  const error = createQuote.error ?? fetchQuote.error;

  function handleContinue() {
    if (!userData?.user) {
      navigate("/signup?next=/checkout");
      return;
    }
    navigate("/checkout");
  }

  return (
    <div className="space-y-6">
      <Stepper step={4} total={5} />

      <div>
        <h1 className="text-2xl font-extrabold text-white">Your quote</h1>
        <p className="text-sm text-ink-400 mt-1">
          1-day cover for <span className="text-white font-semibold">{vehicle.registration}</span>
        </p>
      </div>

      {isLoading && (
        <Card>
          <div className="flex items-center gap-3 text-ink-400">
            <svg className="animate-spin w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Calculating your price…</span>
          </div>
        </Card>
      )}

      {error && (
        <Banner tone="danger">
          {error instanceof ApiError ? error.message : "Couldn't calculate a quote — please try again."}
        </Banner>
      )}

      {result && (
        <Card className="relative overflow-hidden">
          {/* Green glow accent */}
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-400/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative">
            <div className="mb-6">
              <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-1">Total premium</p>
              <div className="text-5xl font-extrabold text-white">{money(result.quote.totalPence)}</div>
              <p className="text-sm text-brand-400 font-semibold mt-1">Inclusive of Insurance Premium Tax</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-ink-800/60 rounded-xl p-3 border border-ink-700/50">
                <p className="text-xs text-ink-500 mb-1">Vehicle</p>
                <p className="text-sm text-white font-semibold">{vehicle.registration}</p>
                <p className="text-xs text-ink-400">{[vehicle.make, vehicle.model].filter(Boolean).join(" ")}</p>
              </div>
              <div className="bg-ink-800/60 rounded-xl p-3 border border-ink-700/50">
                <p className="text-xs text-ink-500 mb-1">Cover period</p>
                <p className="text-sm text-white font-semibold">1 day</p>
                <p className="text-xs text-ink-400">24 continuous hours</p>
              </div>
              <div className="bg-ink-800/60 rounded-xl p-3 border border-ink-700/50">
                <p className="text-xs text-ink-500 mb-1">Starts</p>
                <p className="text-sm text-white font-semibold">
                  {new Date(startDate!).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
              <div className="bg-ink-800/60 rounded-xl p-3 border border-ink-700/50">
                <p className="text-xs text-ink-500 mb-1">Quote valid until</p>
                <p className="text-sm text-white font-semibold">
                  {new Date(result.quote.expiresAt).toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full">
              Continue to checkout →
            </Button>

            <p className="text-xs text-ink-600 mt-3 text-center">
              Ref: {result.quote.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { Banner, Button, Card } from "../components/ui";

interface StatusResponse {
  quoteStatus: string;
  policy: { id: string; policyNumber: string; status: string } | null;
  paymentStatus: string | null;
}

const POLL_INTERVAL_MS = 2000;
const MAX_POLLS = 30;

export function ConfirmationPage() {
  const [params] = useSearchParams();
  const quoteId = params.get("quoteId");
  const reset = useBuyFlowStore((s) => s.reset);
  const [pollCount, setPollCount] = useState(0);

  const status = useQuery<StatusResponse>({
    queryKey: ["checkout-status", quoteId],
    queryFn: () => api.get<StatusResponse>(`/checkout/status?quoteId=${quoteId}`),
    enabled: Boolean(quoteId),
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.policy?.status === "ISSUED") return false;
      return pollCount < MAX_POLLS ? POLL_INTERVAL_MS : false;
    },
  });

  useEffect(() => {
    const interval = setInterval(() => setPollCount((c) => c + 1), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status.data?.policy?.status === "ISSUED") reset();
  }, [status.data?.policy?.status, reset]);

  if (!quoteId) return <Banner tone="danger">Missing quote reference.</Banner>;

  const policy = status.data?.policy;
  const isIssued = policy?.status === "ISSUED";
  const stillWaiting = !isIssued && pollCount < MAX_POLLS;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-brand-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          {isIssued && policy ? (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-400/15 border border-brand-400/30 flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white">You're covered!</h1>
                <p className="text-ink-400 mt-1 text-sm">Policy reference <span className="text-white font-semibold">{policy.policyNumber}</span></p>
              </div>
              <p className="text-sm text-ink-300">
                Your certificate, policy schedule and wording have been generated and emailed to you.
              </p>
              <Link to="/portal">
                <Button className="w-full">View my policy documents →</Button>
              </Link>
            </div>
          ) : stillWaiting ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-ink-800 border border-ink-700 flex items-center justify-center mx-auto">
                <svg className="animate-spin w-7 h-7 text-brand-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </div>
              <h1 className="text-xl font-extrabold text-white">Confirming your payment…</h1>
              <p className="text-sm text-ink-400">
                Verifying your payment server-side. This usually takes a few seconds.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-xl font-extrabold text-white">Payment confirmation pending</h1>
              <Banner tone="warning">
                We couldn't confirm your payment yet.{" "}
                <Link to="/portal" className="underline font-semibold">Check your portal</Link>{" "}
                shortly — it may take a moment to process.
              </Banner>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

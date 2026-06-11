import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import { api, ApiError } from "../lib/api";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { useCurrentUser } from "../lib/auth";
import { Banner, Button, Card, Stepper } from "../components/ui";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function PaymentForm({ quoteId }: { quoteId: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);
    const { error: confirmError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/confirmation?quoteId=${quoteId}`,
      },
    });
    if (confirmError) {
      setError(confirmError.message ?? "Payment could not be processed.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {error && <Banner tone="danger">{error}</Banner>}
      <Button type="submit" disabled={!stripe || submitting} className="w-full">
        {submitting ? "Processing…" : "Pay now — secure checkout"}
      </Button>
    </form>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { vehicle, driver, quoteId } = useBuyFlowStore();
  const { data: userData, isLoading: userLoading } = useCurrentUser();

  const createIntent = useMutation({
    mutationFn: () =>
      api.post<{ clientSecret: string }>("/checkout/create-payment-intent", { quoteId }),
  });

  useEffect(() => {
    if (quoteId && userData?.user && !createIntent.data && !createIntent.isPending) {
      createIntent.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, userData?.user]);

  if (!vehicle || !driver || !quoteId) return <Navigate to="/" replace />;
  if (!userLoading && !userData?.user) return <Navigate to="/signup?next=/checkout" replace />;

  if (!stripePromise) {
    return <Banner tone="danger">Payment is not configured. Please contact support.</Banner>;
  }

  return (
    <div className="space-y-6">
      <Stepper step={5} total={5} />

      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Secure checkout</h1>
        <p className="text-sm text-ink/55 mt-1">Your payment is encrypted and secure</p>
      </div>

      {/* Order summary */}
      <div className="rounded-xl bg-ink/[.03] border border-ink/8 p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Vehicle</p>
          <p className="text-ink font-semibold">
            {vehicle.registration} · {[vehicle.make, vehicle.model].filter(Boolean).join(" ")}
          </p>
          <p className="text-xs text-ink/55 mt-0.5">1-day policy · {driver.firstName} {driver.lastName}</p>
        </div>
      </div>

      {createIntent.isPending && (
        <Card>
          <div className="flex items-center gap-3 text-ink/55">
            <svg className="animate-spin w-5 h-5 text-mint" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Preparing checkout…</span>
          </div>
        </Card>
      )}

      {createIntent.isError && (
        <Banner tone="danger">
          {createIntent.error instanceof ApiError
            ? createIntent.error.message
            : "Couldn't start checkout."}
        </Banner>
      )}

      {createIntent.data && (
        <Card>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret: createIntent.data.clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#3ddc81",
                  colorBackground: "#ffffff",
                  colorText: "#1d1e2c",
                  colorTextSecondary: "#6b6f88",
                  colorTextPlaceholder: "#9598ab",
                  borderRadius: "12px",
                },
              },
            }}
          >
            <PaymentForm quoteId={quoteId} />
          </Elements>
        </Card>
      )}

      <div className="flex items-center justify-between text-xs text-ink/40">
        <div className="flex items-center gap-1.5">
          <span>🔒</span>
          <span>256-bit SSL encryption</span>
        </div>
        <button className="hover:text-ink/60 transition" onClick={() => navigate(-1)}>
          ← Go back
        </button>
      </div>
    </div>
  );
}

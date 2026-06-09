import { Router } from "express";
import { prisma, logEvent } from "../../db/client";
import { stripe } from "./stripe-client";
import { issuePolicyForQuote } from "./issuance";
import { env } from "../../config/env";

/**
 * Stripe webhook router. THIS IS THE ONLY PATH THAT EVER TRANSITIONS A
 * PAYMENT TO SUCCEEDED AND ISSUES A POLICY — never the client redirect.
 *
 * Mounted separately from the rest of /checkout in app.ts, with
 * express.raw({ type: 'application/json' }) applied ONLY to this path and
 * BEFORE the global express.json() parser. Signature verification
 * (stripe.webhooks.constructEvent) requires the untouched raw request body —
 * if express.json() runs first, the body stream is already consumed/parsed
 * and verification fails. This separation is what keeps that ordering simple
 * and impossible to get wrong by accident elsewhere in the router tree.
 */
export const checkoutWebhookRouter = Router();

checkoutWebhookRouter.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  if (!signature || typeof signature !== "string") {
    return res.status(400).send("Missing Stripe-Signature header");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${(err as Error).message}`);
  }

  await logEvent(
    "Payment",
    (event.data.object as { id?: string })?.id ?? "unknown",
    "stripe.webhook.received",
    { type: event.type, eventId: event.id }
  );

  switch (event.type) {
    case "payment_intent.succeeded":
      await handlePaymentSucceeded(event.data.object as import("stripe").Stripe.PaymentIntent);
      break;
    case "payment_intent.payment_failed":
      await handlePaymentFailed(event.data.object as import("stripe").Stripe.PaymentIntent);
      break;
    default:
      // Ignore other event types — explicitly listed so it's clear what we react to.
      break;
  }

  return res.json({ received: true });
});

async function handlePaymentSucceeded(paymentIntent: import("stripe").Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
  if (!payment) {
    await logEvent("Payment", paymentIntent.id, "stripe.webhook.unknown_payment_intent");
    return;
  }

  // Idempotency: if we've already marked this succeeded (e.g. Stripe retried
  // the webhook delivery, or replayed it via `stripe events resend`), do
  // nothing further — never double-issue a policy or double-send an email.
  if (payment.status === "SUCCEEDED") {
    await logEvent("Payment", payment.id, "stripe.webhook.duplicate_ignored", { eventType: "succeeded" });
    return;
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "SUCCEEDED", rawStripeEventJson: paymentIntent as unknown as object },
  });
  await logEvent("Payment", payment.id, "payment.succeeded", { amount: paymentIntent.amount });

  const quoteId = paymentIntent.metadata?.quoteId;
  if (!quoteId) {
    await logEvent("Payment", payment.id, "issuance.skipped_no_quote_id");
    return;
  }

  await issuePolicyForQuote(quoteId, payment.id);
}

async function handlePaymentFailed(paymentIntent: import("stripe").Stripe.PaymentIntent) {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: paymentIntent.id },
  });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: "FAILED", rawStripeEventJson: paymentIntent as unknown as object },
  });
  await logEvent("Payment", payment.id, "payment.failed", {
    lastError: paymentIntent.last_payment_error?.message,
  });
}

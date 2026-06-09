import { Router } from "express";
import { z } from "zod";
import { prisma, logEvent } from "../../db/client";
import { requireAuth } from "../../middleware/require-auth";
import { stripe } from "./stripe-client";

export const checkoutRouter = Router();

const createIntentSchema = z.object({ quoteId: z.string().min(1) });

/**
 * Creates (or reuses) a Stripe PaymentIntent for a quote. The amount is ALWAYS
 * derived from the server-side Quote record — never trust a client-supplied
 * amount for a payment.
 */
checkoutRouter.post("/create-payment-intent", requireAuth, async (req, res) => {
  const parsed = createIntentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "quoteId is required" });
  }

  let quote = await prisma.quote.findUnique({ where: { id: parsed.data.quoteId } });
  if (!quote) {
    return res.status(404).json({ error: "Quote not found" });
  }

  // Quotes can be created before the buyer has an account (lookup → quote
  // happens first; signup is only forced at checkout). The first authenticated
  // user to reach checkout with that quote's id "claims" it as their own —
  // the same pattern as claiming an anonymous cart on login. Quote ids are
  // unguessable CUIDs, so this is safe; an already-claimed quote can never be
  // reassigned to someone else.
  if (quote.userId === null) {
    quote = await prisma.quote.update({ where: { id: quote.id }, data: { userId: req.user!.id } });
    await logEvent("Quote", quote.id, "quote.claimed", { userId: req.user!.id });
  }
  if (quote.userId !== req.user!.id) {
    return res.status(404).json({ error: "Quote not found" });
  }
  if (quote.status === "CONVERTED") {
    return res.status(409).json({ error: "This quote has already been purchased" });
  }
  if (quote.expiresAt < new Date()) {
    return res.status(410).json({ error: "This quote has expired — please get a new one" });
  }

  const existingPolicy = await prisma.policy.findUnique({ where: { quoteId: quote.id } });
  const existingPayment = existingPolicy?.paymentId
    ? await prisma.payment.findUnique({ where: { id: existingPolicy.paymentId } })
    : null;

  let paymentIntent;
  if (existingPayment && existingPayment.status === "REQUIRES_PAYMENT") {
    paymentIntent = await stripe.paymentIntents.retrieve(existingPayment.stripePaymentIntentId);
  } else {
    paymentIntent = await stripe.paymentIntents.create({
      amount: quote.totalPence,
      currency: quote.currency,
      automatic_payment_methods: { enabled: true },
      metadata: { quoteId: quote.id, userId: req.user!.id },
      description: `Day Drive policy purchase — quote ${quote.id}`,
    });

    await prisma.payment.create({
      data: {
        stripePaymentIntentId: paymentIntent.id,
        amountPence: quote.totalPence,
        currency: quote.currency,
        status: "REQUIRES_PAYMENT",
      },
    });
    await logEvent("Quote", quote.id, "payment_intent.created", { paymentIntentId: paymentIntent.id });
  }

  return res.json({
    clientSecret: paymentIntent.client_secret,
    publishableKey: undefined, // frontend already has VITE_STRIPE_PUBLISHABLE_KEY
  });
});

/**
 * Lightweight status endpoint the confirmation page polls — it never trusts
 * the Stripe redirect alone, only the server's view of state (which is only
 * ever updated by the verified webhook below).
 */
checkoutRouter.get("/status", requireAuth, async (req, res) => {
  const quoteId = String(req.query.quoteId ?? "");
  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { policy: { include: { payment: true } } },
  });
  if (!quote || quote.userId !== req.user!.id) {
    return res.status(404).json({ error: "Quote not found" });
  }

  return res.json({
    quoteStatus: quote.status,
    policy: quote.policy
      ? { id: quote.policy.id, policyNumber: quote.policy.policyNumber, status: quote.policy.status }
      : null,
    paymentStatus: quote.policy?.payment?.status ?? null,
  });
});

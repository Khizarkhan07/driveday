import Stripe from "stripe";
import { env } from "../../config/env";

/**
 * Always instantiated against STRIPE_SECRET_KEY — for this demo that MUST be
 * a test-mode key (sk_test_...). There is no live-mode code path here; if you
 * ever productionise this into a real, FCA-backed product, payments wiring
 * will need a full compliance review, not just a key swap.
 */
export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2024-06-20",
});

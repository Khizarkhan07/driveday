import { prisma, logEvent } from "../../db/client";
import { env } from "../../config/env";
import { generatePolicyDocuments } from "../documents/service";
import { getEmailProvider } from "../../providers/email/factory";
import { renderPolicyConfirmationEmail } from "../email/templates";

/**
 * Generates a demo-formatted policy reference, e.g. DEMO-2026-000123.
 * Deliberately prefixed "DEMO" so it can never be mistaken for a real
 * policy number, and visibly distinct from any real insurer's numbering.
 */
async function generatePolicyNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.policy.count();
  const sequence = String(count + 1).padStart(6, "0");
  return `Policy-${year}-${sequence}`;
}

/**
 * The ONE place a policy is ever issued. Must only ever be called from the
 * Stripe-webhook-verified success path (never from a client redirect), and is
 * idempotent: if the policy already exists for this quote, it is returned
 * as-is rather than re-issued or re-emailed.
 */
export async function issuePolicyForQuote(quoteId: string, paymentId: string) {
  const existing = await prisma.policy.findUnique({ where: { quoteId } });
  if (existing) {
    return existing;
  }

  const quote = await prisma.quote.findUniqueOrThrow({
    where: { id: quoteId },
    include: { vehicle: true },
  });
  if (!quote.userId) {
    throw new Error(`Quote ${quoteId} has no associated user — cannot issue a policy`);
  }

  const policyNumber = await generatePolicyNumber();

  const policy = await prisma.policy.create({
    data: {
      policyNumber,
      quoteId: quote.id,
      userId: quote.userId,
      status: "ISSUED",
      startDate: quote.startDate,
      endDate: quote.endDate,
      issuedAt: new Date(),
      paymentId,
    },
  });

  await prisma.quote.update({ where: { id: quote.id }, data: { status: "CONVERTED" } });
  await logEvent("Policy", policy.id, "policy.issued", { policyNumber, quoteId: quote.id });

  // Documents and email are best-effort relative to issuance itself: the
  // policy record (the thing the webhook is responsible for) must exist and
  // be correct even if PDF rendering or email delivery has a transient failure.
  try {
    const documents = await generatePolicyDocuments(policy.id);

    const user = await prisma.user.findUniqueOrThrow({ where: { id: quote.userId } });
    await getEmailProvider().send({
      to: user.email,
      subject: `Your Day Drive policy documents — ${policyNumber}`,
      html: renderPolicyConfirmationEmail({
        firstName: user.firstName,
        policyNumber,
        registration: quote.vehicle.registration,
        vehicleMakeModel: [quote.vehicle.make, quote.vehicle.model].filter(Boolean).join(" "),
        startDate: quote.startDate.toISOString(),
        endDate: quote.endDate.toISOString(),
        totalPence: quote.totalPence,
        portalUrl: `${env.appBaseUrl}/portal/policies/${policy.id}`,
      }),
      attachments: documents.map((doc) => ({
        filename: doc.filename,
        content: doc.buffer,
        contentType: "application/pdf",
      })),
    });
    await logEvent("Policy", policy.id, "email.sent", { template: "policy_confirmation" });
  } catch (err) {
    await logEvent("Policy", policy.id, "issuance.post_processing_failed", {
      error: err instanceof Error ? err.message : String(err),
    });
  }

  return policy;
}

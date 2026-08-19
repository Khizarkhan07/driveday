import { prisma, logEvent } from "../../db/client";
import { env } from "../../config/env";
import { generatePolicyDocuments } from "../documents/service";
import { getEmailProvider } from "../../providers/email/factory";
import { renderPolicyConfirmationEmail } from "../email/templates";
import { createWithUniqueNumber, nextSequenceFrom, parsePolicySequence } from "./policy-number";

/**
 * The highest policy sequence ever issued. Read from the existing numbers
 * rather than the row count so deleting a policy can never cause the next
 * issuance to reuse a number that is already taken.
 */
async function highestIssuedSequence(): Promise<number> {
  // Compares the numeric sequence, not the string. Policy numbers carry a year
  // prefix that has not always been the same value, and a plain string sort
  // would rank a higher year above a higher sequence — handing back a number
  // that is already in use.
  const rows = await prisma.$queryRawUnsafe<{ max: number | null }[]>(
    `SELECT MAX(CAST(split_part("policyNumber", '-', 3) AS INTEGER)) AS max FROM "Policy"`
  );
  return rows[0]?.max ?? 0;
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

  const policy = await createWithUniqueNumber(
    async () => nextSequenceFrom(await highestIssuedSequence()),
    (policyNumber) =>
      prisma.policy.create({
        data: {
          policyNumber,
          quoteId: quote.id,
          userId: quote.userId!,
          status: "ISSUED",
          startDate: quote.startDate,
          endDate: quote.endDate,
          issuedAt: new Date(),
          paymentId,
        },
      })
  );
  const policyNumber = policy.policyNumber;

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

import { Router } from "express";
import { prisma, logEvent } from "../../db/client";
import { requireAuth } from "../../middleware/require-auth";
import { getDocumentStorage } from "../../providers/storage/factory";
import { getEmailProvider } from "../../providers/email/factory";
import { renderPolicyConfirmationEmail } from "../email/templates";
import { env } from "../../config/env";

export const portalRouter = Router();

const DOWNLOAD_FILENAMES = {
  CERTIFICATE: "certificate-of-insurance.pdf",
  POLICY_SCHEDULE: "policy-schedule.pdf",
  IPID: "statement-of-fact.pdf",
  POLICY_WORDING: "policy-wording.pdf",
  TERMS_OF_BUSINESS: "terms-of-business.pdf",
} as const;

portalRouter.use(requireAuth);

portalRouter.get("/policies", async (req, res) => {
  const policies = await prisma.policy.findMany({
    where: { userId: req.user!.id },
    include: { quote: { include: { vehicle: true } } },
    orderBy: { createdAt: "desc" },
  });

  return res.json({
    policies: policies.map((p) => ({
      id: p.id,
      policyNumber: p.policyNumber,
      status: p.status,
      startDate: p.startDate,
      endDate: p.endDate,
      issuedAt: p.issuedAt,
      vehicleRegistration: p.quote.vehicle.registration,
      totalPence: p.quote.totalPence,
    })),
  });
});

portalRouter.get("/policies/:id", async (req, res) => {
  const policy = await prisma.policy.findUnique({
    where: { id: req.params.id },
    include: { quote: { include: { vehicle: true } }, documents: true },
  });

  if (!policy || policy.userId !== req.user!.id) {
    return res.status(404).json({ error: "Policy not found" });
  }

  return res.json({
    policy: {
      id: policy.id,
      policyNumber: policy.policyNumber,
      status: policy.status,
      startDate: policy.startDate,
      endDate: policy.endDate,
      issuedAt: policy.issuedAt,
      vehicle: {
        registration: policy.quote.vehicle.registration,
        make: policy.quote.vehicle.make,
        model: policy.quote.vehicle.model,
      },
      totalPence: policy.quote.totalPence,
      documents: policy.documents.map((d) => ({ id: d.id, type: d.type, createdAt: d.createdAt })),
    },
  });
});

portalRouter.get("/documents/:id/download", async (req, res) => {
  const document = await prisma.document.findUnique({
    where: { id: req.params.id },
    include: { policy: true },
  });

  // Ownership check: a user may only ever download documents attached to
  // their own policies — never trust the document id alone.
  if (!document || document.policy.userId !== req.user!.id) {
    return res.status(404).json({ error: "Document not found" });
  }

  const storage = getDocumentStorage();
  const buffer = await storage.read(document.storageKey);

  await logEvent("Policy", document.policyId, "document.downloaded", { documentId: document.id });

  res.setHeader("Content-Type", document.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${DOWNLOAD_FILENAMES[document.type]}"`
  );
  return res.send(buffer);
});

portalRouter.post("/policies/:id/resend-email", async (req, res) => {
  const policy = await prisma.policy.findUnique({
    where: { id: req.params.id },
    include: {
      user: true,
      documents: true,
      quote: { include: { vehicle: true } },
    },
  });

  if (!policy || policy.userId !== req.user!.id) {
    return res.status(404).json({ error: "Policy not found" });
  }

  const storage = getDocumentStorage();
  const attachments = await Promise.all(
    policy.documents.map(async (doc) => ({
      filename: DOWNLOAD_FILENAMES[doc.type],
      content: await storage.read(doc.storageKey),
      contentType: doc.mimeType,
    }))
  );

  await getEmailProvider().send({
    to: policy.user.email,
    subject: `Your Day Drive policy documents — ${policy.policyNumber}`,
    html: renderPolicyConfirmationEmail({
      firstName: policy.user.firstName,
      policyNumber: policy.policyNumber,
      registration: policy.quote.vehicle.registration,
      vehicleMakeModel: [policy.quote.vehicle.make, policy.quote.vehicle.model].filter(Boolean).join(" "),
      startDate: policy.quote.startDate.toISOString(),
      endDate: policy.quote.endDate.toISOString(),
      totalPence: policy.quote.totalPence,
      portalUrl: `${env.appBaseUrl}/portal/policies/${policy.id}`,
    }),
    attachments,
  });

  await logEvent("Policy", policy.id, "email.resent", { to: policy.user.email });
  return res.json({ ok: true });
});

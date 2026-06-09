import { Router } from "express";
import { prisma, logEvent } from "../../db/client";
import { requireAuth } from "../../middleware/require-auth";
import { getDocumentStorage } from "../../providers/storage/factory";

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

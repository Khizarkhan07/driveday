import { Router } from "express";
import { prisma, logEvent } from "../../db/client";
import { requireAdmin } from "../../middleware/require-auth";
import { getDocumentStorage } from "../../providers/storage/factory";

const DOWNLOAD_FILENAMES = {
  CERTIFICATE: "certificate-of-insurance.pdf",
  POLICY_SCHEDULE: "policy-schedule.pdf",
  IPID: "statement-of-fact.pdf",
  POLICY_WORDING: "policy-wording.pdf",
  TERMS_OF_BUSINESS: "terms-of-business.pdf",
} as const;

export const adminRouter = Router();
adminRouter.use(requireAdmin);

// ─── Users ────────────────────────────────────────────────────────────────────

adminRouter.get("/users", async (req, res) => {
  const search = (req.query.search as string | undefined)?.trim() ?? "";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: "insensitive" as const } },
          { firstName: { contains: search, mode: "insensitive" as const } },
          { lastName: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        _count: { select: { policies: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Fetch last login event for each user
  const userIds = users.map((u) => u.id);
  const loginEvents = await prisma.eventLog.findMany({
    where: {
      entityType: "User",
      entityId: { in: userIds },
      eventType: "user.logged_in",
    },
    orderBy: { createdAt: "desc" },
    distinct: ["entityId"],
  });
  const lastLoginMap = Object.fromEntries(loginEvents.map((e) => [e.entityId, e.createdAt]));

  res.json({
    users: users.map((u) => ({ ...u, lastLoginAt: lastLoginMap[u.id] ?? null })),
    total,
    page,
    pages: Math.ceil(total / limit),
  });
});

adminRouter.get("/users/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      createdAt: true,
      policies: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          policyNumber: true,
          status: true,
          startDate: true,
          endDate: true,
          issuedAt: true,
          createdAt: true,
          quote: { select: { totalPence: true, vehicle: { select: { registration: true, make: true, model: true } } } },
          documents: { select: { id: true, type: true, storageKey: true } },
        },
      },
    },
  });

  if (!user) return res.status(404).json({ error: "User not found" });

  const events = await prisma.eventLog.findMany({
    where: { entityType: "User", entityId: req.params.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({ user, events });
});

// ─── Policies ─────────────────────────────────────────────────────────────────

adminRouter.get("/policies", async (req, res) => {
  const search = (req.query.search as string | undefined)?.trim() ?? "";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 20;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { policyNumber: { contains: search, mode: "insensitive" as const } },
          { user: { email: { contains: search, mode: "insensitive" as const } } },
          { quote: { vehicle: { registration: { contains: search, mode: "insensitive" as const } } } },
        ],
      }
    : {};

  const [policies, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        policyNumber: true,
        status: true,
        startDate: true,
        endDate: true,
        issuedAt: true,
        createdAt: true,
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        quote: { select: { totalPence: true, vehicle: { select: { registration: true, make: true, model: true } } } },
        _count: { select: { documents: true } },
      },
    }),
    prisma.policy.count({ where }),
  ]);

  res.json({ policies, total, page, pages: Math.ceil(total / limit) });
});

adminRouter.get("/policies/:id", async (req, res) => {
  const policy = await prisma.policy.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      quote: { include: { vehicle: true } },
      documents: true,
      payment: true,
    },
  });

  if (!policy) return res.status(404).json({ error: "Policy not found" });

  const events = await prisma.eventLog.findMany({
    where: { entityType: "Policy", entityId: req.params.id },
    orderBy: { createdAt: "desc" },
  });

  res.json({ policy, events });
});

// ─── Events ───────────────────────────────────────────────────────────────────

adminRouter.get("/events", async (req, res) => {
  const search = (req.query.search as string | undefined)?.trim() ?? "";
  const entityType = (req.query.entityType as string | undefined)?.trim() ?? "";
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = 50;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (entityType) where.entityType = entityType;
  if (search) {
    where.OR = [
      { eventType: { contains: search, mode: "insensitive" } },
      { entityId: { contains: search, mode: "insensitive" } },
    ];
  }

  const [events, total] = await Promise.all([
    prisma.eventLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.eventLog.count({ where }),
  ]);

  res.json({ events, total, page, pages: Math.ceil(total / limit) });
});

// ─── Dashboard stats ──────────────────────────────────────────────────────────

adminRouter.get("/stats", async (_req, res) => {
  const [totalUsers, totalPolicies, totalRevenuePence, recentEvents] = await Promise.all([
    prisma.user.count(),
    prisma.policy.count(),
    prisma.payment.aggregate({ where: { status: "SUCCEEDED" }, _sum: { amountPence: true } }),
    prisma.eventLog.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
  ]);

  res.json({
    totalUsers,
    totalPolicies,
    totalRevenuePence: totalRevenuePence._sum.amountPence ?? 0,
    recentEvents,
  });
});

// ─── Documents ────────────────────────────────────────────────────────────────

adminRouter.get("/documents/:id/download", async (req, res) => {
  const document = await prisma.document.findUnique({
    where: { id: req.params.id },
  });

  if (!document) {
    return res.status(404).json({ error: "Document not found" });
  }

  const storage = getDocumentStorage();
  const buffer = await storage.read(document.storageKey);

  await logEvent("Policy", document.policyId, "admin.document.downloaded", { documentId: document.id });

  res.setHeader("Content-Type", document.mimeType);
  res.setHeader(
    "Content-Disposition",
    `inline; filename="${DOWNLOAD_FILENAMES[document.type as keyof typeof DOWNLOAD_FILENAMES]}"`
  );
  return res.send(buffer);
});

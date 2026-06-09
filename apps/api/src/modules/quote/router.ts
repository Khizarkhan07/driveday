import { Router } from "express";
import { createQuoteRequestSchema } from "@motorcover/shared-types";
import { prisma, logEvent } from "../../db/client";
import { attachUser } from "../../middleware/require-auth";
import { calculatePremium } from "./pricing";
import { pricingConfig } from "./pricing.config";

export const quoteRouter = Router();

function calculateAge(dateOfBirth: string, asOf: Date): number {
  const dob = new Date(dateOfBirth);
  let age = asOf.getFullYear() - dob.getFullYear();
  const hasHadBirthdayThisYear =
    asOf.getMonth() > dob.getMonth() ||
    (asOf.getMonth() === dob.getMonth() && asOf.getDate() >= dob.getDate());
  if (!hasHadBirthdayThisYear) age -= 1;
  return age;
}

quoteRouter.post("/", attachUser, async (req, res) => {
  const parsed = createQuoteRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
  }
  const { vehicleId, startDate, driver } = parsed.data;

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found — look it up again" });
  }

  const start = new Date(startDate);
  if (start < new Date(Date.now() - 60_000)) {
    return res.status(400).json({ error: "Cover start must be in the future" });
  }

  // Always 1-day cover — end is always exactly 24 hours after start
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const durationDays = 1;

  const driverAge = calculateAge(driver.dateOfBirth, start);
  const breakdown = calculatePremium({ driverAge });

  const expiresAt = new Date(Date.now() + pricingConfig.quoteValidityHours * 60 * 60 * 1000);

  const quote = await prisma.quote.create({
    data: {
      userId: req.user?.id,
      vehicleId: vehicle.id,
      startDate: start,
      endDate: end,
      durationDays,
      driverDetails: driver as object,
      pricingBreakdown: breakdown as object,
      totalPence: breakdown.totalPence,
      currency: breakdown.currency,
      status: "DRAFT",
      expiresAt,
    },
  });
  await logEvent("Quote", quote.id, "quote.created", { totalPence: breakdown.totalPence });

  return res.status(201).json({
    quote: {
      id: quote.id,
      vehicleId: quote.vehicleId,
      startDate: quote.startDate,
      endDate: quote.endDate,
      durationDays: quote.durationDays,
      pricingBreakdown: breakdown,
      totalPence: quote.totalPence,
      currency: quote.currency,
      status: quote.status,
      expiresAt: quote.expiresAt,
    },
  });
});

quoteRouter.get("/:id", attachUser, async (req, res) => {
  const quote = await prisma.quote.findUnique({
    where: { id: req.params.id },
    include: { vehicle: true },
  });
  if (!quote) {
    return res.status(404).json({ error: "Quote not found" });
  }

  return res.json({
    quote: {
      id: quote.id,
      vehicle: {
        registration: quote.vehicle.registration,
        make: quote.vehicle.make,
        model: quote.vehicle.model,
      },
      startDate: quote.startDate,
      endDate: quote.endDate,
      durationDays: quote.durationDays,
      pricingBreakdown: quote.pricingBreakdown,
      totalPence: quote.totalPence,
      currency: quote.currency,
      status: quote.status,
      expiresAt: quote.expiresAt,
    },
  });
});

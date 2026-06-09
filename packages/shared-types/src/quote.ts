import { z } from "zod";

export const driverDetailsSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().date().refine((dob) => {
    const today = new Date();
    const birth = new Date(dob);
    const age =
      today.getFullYear() -
      birth.getFullYear() -
      (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    return age >= 18;
  }, { message: "Driver must be at least 18 years old" }),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  postcode: z.string().min(2),
  licenceNumber: z.string().min(5),
  yearsHeldLicence: z.number().int().min(0).max(80),
  hasConvictions: z.boolean(),
  hasClaims: z.boolean(),
});
export type DriverDetails = z.infer<typeof driverDetailsSchema>;

export const coverDetailsSchema = z
  .object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  })
  .refine((v) => new Date(v.endDate) > new Date(v.startDate), {
    message: "endDate must be after startDate",
    path: ["endDate"],
  });
export type CoverDetails = z.infer<typeof coverDetailsSchema>;

export const createQuoteRequestSchema = z.object({
  vehicleId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  driver: driverDetailsSchema,
});
export type CreateQuoteRequest = z.infer<typeof createQuoteRequestSchema>;

export const pricingBreakdownSchema = z.object({
  baseRatePence: z.number().int(),
  perDayRatePence: z.number().int(),
  durationDays: z.number().int(),
  ageLoadingPercent: z.number(),
  vehicleTypeLoadingPercent: z.number(),
  claimsOrConvictionsLoadingPercent: z.number(),
  subtotalPence: z.number().int(),
  totalPence: z.number().int(),
  currency: z.literal("gbp"),
});
export type PricingBreakdown = z.infer<typeof pricingBreakdownSchema>;

export const quoteStatusSchema = z.enum(["DRAFT", "SAVED", "EXPIRED", "CONVERTED"]);
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;

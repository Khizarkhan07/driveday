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
  /**
   * Optional: the driver may decline to share it. When given it must still be
   * a valid UK licence number — an empty string is treated as "not provided"
   * rather than as a malformed value, so declining cannot fail validation.
   */
  licenceNumber: z
    .string()
    .regex(
      /^[A-Z9]{5}\d{6}[A-Z9]{2}\d[A-Z]{2}$/i,
      "Enter a valid UK driving licence number (e.g. MORGA753116SM9IJ)"
    )
    .optional()
    .or(z.literal("")),
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

/**
 * PERSONAL is the standard social, domestic and pleasure policy.
 *
 * BUSINESS is a distinct product rather than an add-on: it covers carriage of
 * goods for hire and reward for the named delivery platforms, and *excludes*
 * social, domestic and pleasure use including commuting. The two are mutually
 * exclusive, which is why the documents swap their wording rather than append.
 */
export const coverTypeSchema = z.enum(["PERSONAL", "BUSINESS"]);
export type CoverType = z.infer<typeof coverTypeSchema>;

export const COVER_TYPE_LABELS: Record<CoverType, string> = {
  PERSONAL: "Personal",
  BUSINESS: "Business",
};

/** Delivery platforms the business policy covers work for. */
export const BUSINESS_COVER_PLATFORMS = ["JUST EAT", "DELIVEROO", "UBER EATS"] as const;

export const createQuoteRequestSchema = z.object({
  vehicleId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  driver: driverDetailsSchema,
  // Optional so clients that predate business cover keep working.
  coverType: coverTypeSchema.default("PERSONAL"),
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

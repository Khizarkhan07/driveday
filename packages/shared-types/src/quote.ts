import { z } from "zod";
import { MARKETS, currencyCodeSchema, type MarketConfig } from "./market";

/**
 * Driver details, with the one market-dependent field — the licence number
 * format — taken from the market config.
 *
 * The licence number is optional in every market: the driver may decline to
 * share it, and an empty string counts as "not provided" rather than as a
 * malformed value, so declining cannot fail validation. Where the market has
 * no supplied format (`licencePattern: null`) any non-empty value is accepted,
 * because guessing a pattern would reject genuine licence numbers.
 */
export function driverDetailsSchemaFor(market: MarketConfig) {
  const licenceNumber = market.licencePattern
    ? z.string().regex(market.licencePattern, market.licenceMessage)
    : z.string();

  return z.object({
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
    licenceNumber: licenceNumber.optional().or(z.literal("")),
    yearsHeldLicence: z.number().int().min(0).max(80),
    hasConvictions: z.boolean(),
    hasClaims: z.boolean(),
  });
}

/**
 * The UK market's driver schema. Kept as a named export because it predates
 * multi-market support and is still the right default for UK-only callers.
 */
export const driverDetailsSchema = driverDetailsSchemaFor(MARKETS.uk);
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

export function createQuoteRequestSchemaFor(market: MarketConfig) {
  return z.object({
    vehicleId: z.string().min(1),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    driver: driverDetailsSchemaFor(market),
    // Optional so clients that predate business cover keep working.
    coverType: coverTypeSchema.default("PERSONAL"),
  });
}

export const createQuoteRequestSchema = createQuoteRequestSchemaFor(MARKETS.uk);
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
  currency: currencyCodeSchema,
});
export type PricingBreakdown = z.infer<typeof pricingBreakdownSchema>;

export const quoteStatusSchema = z.enum(["DRAFT", "SAVED", "EXPIRED", "CONVERTED"]);
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;

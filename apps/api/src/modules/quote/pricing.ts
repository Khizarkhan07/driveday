import type { CoverType, PricingBreakdown } from "@motorcover/shared-types";
import { pricingConfig as defaultConfig } from "./pricing.config";

export interface PricingInput {
  coverType: CoverType;
}

export type PricingConfig = typeof defaultConfig;

export function calculatePremium(
  input: PricingInput,
  config: PricingConfig = defaultConfig
): PricingBreakdown {
  const ratePence = resolveRate(input.coverType, config);

  return {
    baseRatePence: ratePence,
    perDayRatePence: 0,
    durationDays: 1,
    ageLoadingPercent: 0,
    vehicleTypeLoadingPercent: 0,
    claimsOrConvictionsLoadingPercent: 0,
    subtotalPence: ratePence,
    totalPence: ratePence,
    currency: "gbp",
  };
}

/**
 * Falls back to the personal rate for anything unrecognised. `coverType` is a
 * plain string in the database, so a row written by hand — or before business
 * cover existed — can still reach this, and must never fail a quote.
 */
function resolveRate(coverType: CoverType, config: PricingConfig): number {
  return config.coverTypeRates[coverType] ?? config.coverTypeRates.PERSONAL;
}

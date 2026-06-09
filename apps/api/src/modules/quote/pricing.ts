import type { PricingBreakdown } from "@motorcover/shared-types";
import { pricingConfig as defaultConfig } from "./pricing.config";

export interface PricingInput {
  driverAge: number;
}

export type PricingConfig = typeof defaultConfig;

export function calculatePremium(
  input: PricingInput,
  config: PricingConfig = defaultConfig
): PricingBreakdown {
  const ratePence = resolveRate(input.driverAge, config);

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

function resolveRate(age: number, config: PricingConfig): number {
  for (const band of config.ageBands) {
    if (age <= band.maxAge) return band.ratePence;
  }
  return config.defaultRatePence;
}

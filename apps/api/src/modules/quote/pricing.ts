import type { PricingBreakdown, VehicleType } from "@motorcover/shared-types";
import { pricingConfig as defaultConfig } from "./pricing.config";

export interface PricingInput {
  vehicleType: VehicleType;
}

export type PricingConfig = typeof defaultConfig;

export function calculatePremium(
  input: PricingInput,
  config: PricingConfig = defaultConfig
): PricingBreakdown {
  const ratePence = resolveRate(input.vehicleType, config);

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
 * Falls back to the car rate for anything unrecognised. `vehicleType` is a
 * plain string in the database, so a row written before a type existed (or by
 * hand) can still reach this.
 */
function resolveRate(vehicleType: VehicleType, config: PricingConfig): number {
  return config.vehicleTypeRates[vehicleType] ?? config.vehicleTypeRates.car;
}

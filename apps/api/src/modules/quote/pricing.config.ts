import type { CoverType } from "@motorcover/shared-types";

/**
 * 1-day short term motor insurance — flat rate by cover type.
 *
 * Vehicle type no longer affects the premium. It is still classified from DVLA
 * data and stored on the vehicle (see classifyVehicleType) for reporting and
 * underwriting, but a bike, car, van and HGV on the same cover type all pay
 * the same price.
 */
export const pricingConfig = {
  coverTypeRates: {
    PERSONAL: 1500, // £15
    BUSINESS: 2500, // £25
  } satisfies Record<CoverType, number>,

  quoteValidityHours: 24,
};

import type { CoverType, MarketConfig, PricingBreakdown } from "@motorcover/shared-types";

export interface PricingInput {
  coverType: CoverType;
}

/**
 * Prices a 1-day policy for a market.
 *
 * `market` is required rather than defaulted: a silent fallback here would
 * price an Irish quote in sterling, which is the one mistake this function
 * must not be able to make quietly.
 */
export function calculatePremium(
  input: PricingInput,
  market: MarketConfig
): PricingBreakdown {
  const ratePence = resolveRate(input.coverType, market);

  return {
    baseRatePence: ratePence,
    perDayRatePence: 0,
    durationDays: 1,
    ageLoadingPercent: 0,
    vehicleTypeLoadingPercent: 0,
    claimsOrConvictionsLoadingPercent: 0,
    subtotalPence: ratePence,
    totalPence: ratePence,
    currency: market.currency,
  };
}

/**
 * Falls back to the personal rate for anything unrecognised. `coverType` is a
 * plain string in the database, so a row written by hand — or before business
 * cover existed — can still reach this, and must never fail a quote.
 */
function resolveRate(coverType: CoverType, market: MarketConfig): number {
  return market.coverTypeRates[coverType] ?? market.coverTypeRates.PERSONAL;
}

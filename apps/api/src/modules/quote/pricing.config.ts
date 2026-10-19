/**
 * Pricing settings that are the same in every market.
 *
 * The rates themselves are per-market and live in the market table in
 * @motorcover/shared-types, so that a market's currency and its figures cannot
 * drift apart.
 */
export const pricingConfig = {
  quoteValidityHours: 24,
};

/**
 * 1-day short term motor insurance — flat rate by driver age band.
 */
export const pricingConfig = {
  ageBands: [
    { maxAge: 24, ratePence: 5000 },   // 18–24 → £50
    { maxAge: 39, ratePence: 4000 },   // 25–39 → £40
    { maxAge: 60, ratePence: 3000 },   // 40–60 → £30
  ],
  defaultRatePence: 4000, // fallback for ages outside the bands above

  quoteValidityHours: 24,
};

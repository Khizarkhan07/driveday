/**
 * 1-day short term motor insurance — flat rate by driver age band.
 */
export const pricingConfig = {
  ageBands: [
    { maxAge: 24, ratePence: 1500 },   // 18–24 → £15
    { maxAge: 39, ratePence: 1500 },   // 25–39 → £15
    { maxAge: 60, ratePence: 1500 },   // 40–60 → £15
  ],
  defaultRatePence: 1500, // fallback for ages outside the bands above

  quoteValidityHours: 24,
};

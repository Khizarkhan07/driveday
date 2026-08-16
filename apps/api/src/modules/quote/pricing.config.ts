import type { VehicleType } from "@motorcover/shared-types";

/**
 * 1-day short term motor insurance — flat rate by vehicle type.
 *
 * Driver age no longer affects the premium. It previously selected a rate from
 * age bands, but all three bands had been flattened to the same value, so the
 * band lookup had no effect on what anyone paid.
 *
 * "other" (buses, coaches, trailers, tractors, and any category the classifier
 * doesn't recognise) is charged at the car rate — a lookup returning an
 * unfamiliar type should never fail a quote.
 */
export const pricingConfig = {
  vehicleTypeRates: {
    motorcycle: 1500, // £15
    car: 2500, // £25
    van: 3000, // £30
    hgv: 4500, // £45
    other: 2500, // £25 — same as car
  } satisfies Record<VehicleType, number>,

  quoteValidityHours: 24,
};

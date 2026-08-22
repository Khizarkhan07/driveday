import { describe, expect, it } from "vitest";
import { calculatePremium } from "./pricing";
import { pricingConfig } from "./pricing.config";

describe("calculatePremium", () => {
  it("charges £15 for personal cover", () => {
    expect(calculatePremium({ coverType: "PERSONAL" }).totalPence).toBe(1500);
  });

  it("charges £25 for business cover", () => {
    expect(calculatePremium({ coverType: "BUSINESS" }).totalPence).toBe(2500);
  });

  it("charges the personal rate for an unrecognised cover type", () => {
    // coverType is a plain string column, so a hand-edited or legacy row can
    // carry a value the config has no rate for. It must not fail a quote.
    expect(calculatePremium({ coverType: "spaceship" as never }).totalPence).toBe(1500);
  });

  it("prices every configured cover type without gaps", () => {
    for (const type of Object.keys(pricingConfig.coverTypeRates)) {
      expect(calculatePremium({ coverType: type as never }).totalPence).toBeGreaterThan(0);
    }
  });

  it("charges business more than personal", () => {
    const personal = calculatePremium({ coverType: "PERSONAL" }).totalPence;
    const business = calculatePremium({ coverType: "BUSINESS" }).totalPence;
    expect(business).toBeGreaterThan(personal);
  });

  it("always returns durationDays = 1", () => {
    expect(calculatePremium({ coverType: "PERSONAL" }).durationDays).toBe(1);
  });

  it("reports the rate as base, subtotal and total alike", () => {
    const b = calculatePremium({ coverType: "BUSINESS" });
    expect(b.baseRatePence).toBe(2500);
    expect(b.subtotalPence).toBe(2500);
    expect(b.totalPence).toBe(2500);
    expect(b.currency).toBe("gbp");
  });

  it("applies no loadings", () => {
    const b = calculatePremium({ coverType: "PERSONAL" });
    expect(b.ageLoadingPercent).toBe(0);
    expect(b.vehicleTypeLoadingPercent).toBe(0);
    expect(b.claimsOrConvictionsLoadingPercent).toBe(0);
  });
});

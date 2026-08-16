import { describe, expect, it } from "vitest";
import { calculatePremium } from "./pricing";
import { pricingConfig } from "./pricing.config";

describe("calculatePremium", () => {
  it("charges £15 for a motorcycle", () => {
    expect(calculatePremium({ vehicleType: "motorcycle" }).totalPence).toBe(1500);
  });

  it("charges £25 for a car", () => {
    expect(calculatePremium({ vehicleType: "car" }).totalPence).toBe(2500);
  });

  it("charges £30 for a van", () => {
    expect(calculatePremium({ vehicleType: "van" }).totalPence).toBe(3000);
  });

  it("charges £45 for an HGV", () => {
    expect(calculatePremium({ vehicleType: "hgv" }).totalPence).toBe(4500);
  });

  it("charges the car rate for an unclassified vehicle", () => {
    expect(calculatePremium({ vehicleType: "other" }).totalPence).toBe(2500);
    expect(calculatePremium({ vehicleType: "other" }).totalPence).toBe(
      calculatePremium({ vehicleType: "car" }).totalPence
    );
  });

  it("falls back to the car rate for a type not in the config", () => {
    // vehicleType is a plain string in the database, so a hand-edited or
    // legacy row can carry a value the config has no rate for.
    expect(calculatePremium({ vehicleType: "spaceship" as never }).totalPence).toBe(2500);
  });

  it("prices every configured type without gaps", () => {
    for (const type of Object.keys(pricingConfig.vehicleTypeRates)) {
      const total = calculatePremium({ vehicleType: type as never }).totalPence;
      expect(total).toBeGreaterThan(0);
    }
  });

  it("orders rates bike < car < van < hgv", () => {
    const bike = calculatePremium({ vehicleType: "motorcycle" }).totalPence;
    const car = calculatePremium({ vehicleType: "car" }).totalPence;
    const van = calculatePremium({ vehicleType: "van" }).totalPence;
    const hgv = calculatePremium({ vehicleType: "hgv" }).totalPence;
    expect(bike).toBeLessThan(car);
    expect(car).toBeLessThan(van);
    expect(van).toBeLessThan(hgv);
  });

  it("always returns durationDays = 1", () => {
    expect(calculatePremium({ vehicleType: "car" }).durationDays).toBe(1);
  });

  it("reports the rate as the base, subtotal and total alike", () => {
    const b = calculatePremium({ vehicleType: "hgv" });
    expect(b.baseRatePence).toBe(4500);
    expect(b.subtotalPence).toBe(4500);
    expect(b.totalPence).toBe(4500);
    expect(b.currency).toBe("gbp");
  });

  it("applies no loadings", () => {
    const b = calculatePremium({ vehicleType: "van" });
    expect(b.ageLoadingPercent).toBe(0);
    expect(b.vehicleTypeLoadingPercent).toBe(0);
    expect(b.claimsOrConvictionsLoadingPercent).toBe(0);
  });
});

import { marketFor } from "@motorcover/shared-types";
import { describe, expect, it } from "vitest";
import { calculatePremium } from "./pricing";

const uk = marketFor("uk");
const ie = marketFor("ie");

describe("calculatePremium — UK market", () => {
  it("charges £15 for personal cover", () => {
    expect(calculatePremium({ coverType: "PERSONAL" }, uk).totalPence).toBe(1500);
  });

  it("charges £25 for business cover", () => {
    expect(calculatePremium({ coverType: "BUSINESS" }, uk).totalPence).toBe(2500);
  });

  it("prices in sterling", () => {
    expect(calculatePremium({ coverType: "PERSONAL" }, uk).currency).toBe("gbp");
  });

  it("charges the personal rate for an unrecognised cover type", () => {
    // coverType is a plain string column, so a hand-edited or legacy row can
    // carry a value the config has no rate for. It must not fail a quote.
    expect(calculatePremium({ coverType: "spaceship" as never }, uk).totalPence).toBe(1500);
  });

  it("prices every configured cover type without gaps", () => {
    for (const type of Object.keys(uk.coverTypeRates)) {
      expect(calculatePremium({ coverType: type as never }, uk).totalPence).toBeGreaterThan(0);
    }
  });

  it("charges business more than personal", () => {
    const personal = calculatePremium({ coverType: "PERSONAL" }, uk).totalPence;
    const business = calculatePremium({ coverType: "BUSINESS" }, uk).totalPence;
    expect(business).toBeGreaterThan(personal);
  });

  it("always returns durationDays = 1", () => {
    expect(calculatePremium({ coverType: "PERSONAL" }, uk).durationDays).toBe(1);
  });

  it("reports the rate as base, subtotal and total alike", () => {
    const b = calculatePremium({ coverType: "BUSINESS" }, uk);
    expect(b.baseRatePence).toBe(2500);
    expect(b.subtotalPence).toBe(2500);
    expect(b.totalPence).toBe(2500);
    expect(b.currency).toBe("gbp");
  });

  it("applies no loadings", () => {
    const b = calculatePremium({ coverType: "PERSONAL" }, uk);
    expect(b.ageLoadingPercent).toBe(0);
    expect(b.vehicleTypeLoadingPercent).toBe(0);
    expect(b.claimsOrConvictionsLoadingPercent).toBe(0);
  });
});

describe("calculatePremium — Irish market", () => {
  it("charges €15 for personal cover", () => {
    const b = calculatePremium({ coverType: "PERSONAL" }, ie);
    expect(b.totalPence).toBe(1500);
    expect(b.currency).toBe("eur");
  });

  it("charges €25 for business cover", () => {
    const b = calculatePremium({ coverType: "BUSINESS" }, ie);
    expect(b.totalPence).toBe(2500);
    expect(b.currency).toBe("eur");
  });

  it("falls back to the personal rate for an unrecognised cover type, in euro", () => {
    const b = calculatePremium({ coverType: "spaceship" as never }, ie);
    expect(b.totalPence).toBe(1500);
    expect(b.currency).toBe("eur");
  });
});

describe("calculatePremium — markets do not leak into each other", () => {
  it("quotes the same figures but never the same currency", () => {
    for (const coverType of ["PERSONAL", "BUSINESS"] as const) {
      const a = calculatePremium({ coverType }, uk);
      const b = calculatePremium({ coverType }, ie);
      expect(a.totalPence).toBe(b.totalPence);
      expect(a.currency).not.toBe(b.currency);
    }
  });
});

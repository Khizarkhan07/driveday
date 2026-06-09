import { describe, expect, it } from "vitest";
import { calculatePremium } from "./pricing";

describe("calculatePremium", () => {
  it("charges £50 for drivers aged 18–24", () => {
    expect(calculatePremium({ driverAge: 20 }).totalPence).toBe(5000);
    expect(calculatePremium({ driverAge: 24 }).totalPence).toBe(5000);
  });

  it("charges £40 for drivers aged 25–39", () => {
    expect(calculatePremium({ driverAge: 25 }).totalPence).toBe(4000);
    expect(calculatePremium({ driverAge: 39 }).totalPence).toBe(4000);
  });

  it("charges £30 for drivers aged 40–60", () => {
    expect(calculatePremium({ driverAge: 40 }).totalPence).toBe(3000);
    expect(calculatePremium({ driverAge: 60 }).totalPence).toBe(3000);
  });

  it("always returns durationDays = 1", () => {
    expect(calculatePremium({ driverAge: 35 }).durationDays).toBe(1);
  });

  it("uses the default rate for ages outside all bands", () => {
    expect(calculatePremium({ driverAge: 75 }).totalPence).toBe(4000);
  });
});

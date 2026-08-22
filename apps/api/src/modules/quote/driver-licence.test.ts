import { describe, expect, it } from "vitest";
import { driverDetailsSchema } from "@motorcover/shared-types";

const base = {
  firstName: "Test",
  lastName: "Driver",
  dateOfBirth: "1990-05-05",
  addressLine1: "1 Test St",
  city: "London",
  postcode: "SW1A1AA",
  yearsHeldLicence: 5,
  hasConvictions: false,
  hasClaims: false,
};

describe("driverDetailsSchema — licence number", () => {
  it("accepts a valid licence number", () => {
    const r = driverDetailsSchema.safeParse({ ...base, licenceNumber: "MORGA753116SM9IJ" });
    expect(r.success).toBe(true);
  });

  it("accepts an empty string when the driver declines to share it", () => {
    const r = driverDetailsSchema.safeParse({ ...base, licenceNumber: "" });
    expect(r.success).toBe(true);
  });

  it("accepts the field being omitted entirely", () => {
    const r = driverDetailsSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("still rejects a malformed licence number when one is given", () => {
    const r = driverDetailsSchema.safeParse({ ...base, licenceNumber: "NOTALICENCE" });
    expect(r.success).toBe(false);
  });

  it("does not weaken any other required field", () => {
    expect(driverDetailsSchema.safeParse({ ...base, firstName: "" }).success).toBe(false);
    expect(driverDetailsSchema.safeParse({ ...base, postcode: "" }).success).toBe(false);
    expect(driverDetailsSchema.safeParse({ ...base, dateOfBirth: "2020-01-01" }).success).toBe(false);
  });
});

import { describe, expect, it } from "vitest";
import {
  driverDetailsSchema,
  driverDetailsSchemaFor,
  marketFor,
} from "@motorcover/shared-types";

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

describe("driverDetailsSchemaFor — per market", () => {
  const uk = driverDetailsSchemaFor(marketFor("uk"));
  const ie = driverDetailsSchemaFor(marketFor("ie"));

  it("matches the default schema for the UK market", () => {
    expect(uk.safeParse({ ...base, licenceNumber: "MORGA753116SM9IJ" }).success).toBe(true);
    expect(uk.safeParse({ ...base, licenceNumber: "NOTALICENCE" }).success).toBe(false);
  });

  // The Irish licence format is not supplied, so validating against the UK
  // pattern would reject every genuine Irish licence number.
  it("accepts an Irish licence number the UK pattern would reject", () => {
    const irish = { ...base, postcode: "D02 AF30", licenceNumber: "123456789" };
    expect(ie.safeParse(irish).success).toBe(true);
    expect(uk.safeParse(irish).success).toBe(false);
  });

  it("still lets an Irish driver decline to share the number", () => {
    expect(ie.safeParse({ ...base, licenceNumber: "" }).success).toBe(true);
    expect(ie.safeParse(base).success).toBe(true);
  });

  it("does not weaken any other field in either market", () => {
    for (const schema of [uk, ie]) {
      expect(schema.safeParse({ ...base, firstName: "" }).success).toBe(false);
      expect(schema.safeParse({ ...base, postcode: "" }).success).toBe(false);
      expect(schema.safeParse({ ...base, dateOfBirth: "2020-01-01" }).success).toBe(false);
    }
  });

  it("accepts an Eircode, which is shorter and spaced unlike a UK postcode", () => {
    expect(ie.safeParse({ ...base, postcode: "D02 AF30" }).success).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { manualVehicleEntrySchema, vehicleLookupResultSchema } from "@motorcover/shared-types";
import { buildManualVehicleRecord } from "./manual-entry";

/**
 * Manual entry is the fallback for vehicles the registers don't know about —
 * typically brand new cars that haven't propagated yet. Nothing here is
 * verified against an external source, so the schema is the only guard on
 * what ends up printed on a Certificate of Insurance.
 */
const validEntry = {
  registration: "AB12 CDE",
  country: "uk" as const,
  make: "Tesla",
  model: "Model 3",
  colour: "White",
  yearOfManufacture: 2026,
  fuelType: "Electric",
  vehicleType: "car" as const,
  detailsDeclared: true,
};

describe("manualVehicleEntrySchema", () => {
  it("accepts a complete entry", () => {
    const parsed = manualVehicleEntrySchema.safeParse(validEntry);
    expect(parsed.success).toBe(true);
  });

  it("normalises the registration the same way a lookup does", () => {
    const parsed = manualVehicleEntrySchema.parse(validEntry);
    expect(parsed.registration).toBe("AB12CDE");
  });

  it.each(["make", "model", "colour", "yearOfManufacture", "fuelType", "vehicleType"])(
    "rejects an entry missing %s",
    (field) => {
      const { [field]: _omitted, ...rest } = validEntry as Record<string, unknown>;
      expect(manualVehicleEntrySchema.safeParse(rest).success).toBe(false);
    }
  );

  it.each(["make", "model", "colour"])("rejects a blank %s", (field) => {
    const parsed = manualVehicleEntrySchema.safeParse({ ...validEntry, [field]: "   " });
    expect(parsed.success).toBe(false);
  });

  it("rejects an entry where the accuracy declaration is not ticked", () => {
    const parsed = manualVehicleEntrySchema.safeParse({ ...validEntry, detailsDeclared: false });
    expect(parsed.success).toBe(false);
  });

  it("validates the registration against the Irish format when country is ie", () => {
    const irish = { ...validEntry, country: "ie" as const, registration: "161-D-12345" };
    expect(manualVehicleEntrySchema.parse(irish).registration).toBe("161D12345");
    expect(
      manualVehicleEntrySchema.safeParse({ ...validEntry, country: "ie" }).success
    ).toBe(false);
  });

  it("rejects a year of manufacture before cars existed", () => {
    expect(
      manualVehicleEntrySchema.safeParse({ ...validEntry, yearOfManufacture: 1899 }).success
    ).toBe(false);
  });

  it("allows next year, since plates are issued ahead of the calendar year", () => {
    const nextYear = new Date().getFullYear() + 1;
    expect(
      manualVehicleEntrySchema.safeParse({ ...validEntry, yearOfManufacture: nextYear }).success
    ).toBe(true);
  });

  it("rejects a year of manufacture further ahead than that", () => {
    const tooFar = new Date().getFullYear() + 2;
    expect(
      manualVehicleEntrySchema.safeParse({ ...validEntry, yearOfManufacture: tooFar }).success
    ).toBe(false);
  });

  it("rejects a fuel type outside the offered list", () => {
    expect(
      manualVehicleEntrySchema.safeParse({ ...validEntry, fuelType: "Coal" }).success
    ).toBe(false);
  });

  it("rejects a vehicle type outside the offered list", () => {
    expect(
      manualVehicleEntrySchema.safeParse({ ...validEntry, vehicleType: "spaceship" }).success
    ).toBe(false);
  });
});

describe("buildManualVehicleRecord", () => {
  const declaredAt = new Date("2026-09-19T10:30:00.000Z");
  const entry = manualVehicleEntrySchema.parse(validEntry);

  it("stores the normalised registration, not what was typed", () => {
    expect(buildManualVehicleRecord(entry, declaredAt).registration).toBe("AB12CDE");
  });

  it("marks the vehicle as manually sourced", () => {
    expect(buildManualVehicleRecord(entry, declaredAt).source).toBe("manual");
  });

  it("carries every declared detail through to the record", () => {
    expect(buildManualVehicleRecord(entry, declaredAt)).toMatchObject({
      make: "Tesla",
      model: "Model 3",
      colour: "White",
      yearOfManufacture: 2026,
      fuelType: "Electric",
      vehicleType: "car",
    });
  });

  it("records the declaration and the country searched in the raw payload", () => {
    expect(buildManualVehicleRecord(entry, declaredAt).rawLookupJson).toEqual({
      enteredManually: true,
      declaredAt: "2026-09-19T10:30:00.000Z",
      country: "uk",
    });
  });

  it("keeps the declaration out of the vehicle columns", () => {
    const record = buildManualVehicleRecord(entry, declaredAt) as unknown as Record<string, unknown>;
    expect(record.detailsDeclared).toBeUndefined();
    expect(record.country).toBeUndefined();
  });

  it("produces a record the rest of the flow can read as a lookup result", () => {
    const { rawLookupJson: _raw, ...result } = buildManualVehicleRecord(entry, declaredAt);
    expect(vehicleLookupResultSchema.safeParse(result).success).toBe(true);
  });
});

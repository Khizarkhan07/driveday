import {
  manualVehicleEntrySchemaFor,
  marketFor,
  vehicleLookupRequestSchemaFor,
} from "@motorcover/shared-types";
import { describe, expect, it } from "vitest";

const uk = marketFor("uk");
const ie = marketFor("ie");

const UK_REG = "YD66TXP";
const IRISH_REG = "161-D-12345";

describe("vehicleLookupRequestSchemaFor — the market fixes the country", () => {
  it("accepts its own market's plate format", () => {
    expect(vehicleLookupRequestSchemaFor(uk).safeParse({ registration: UK_REG }).success).toBe(true);
    expect(vehicleLookupRequestSchemaFor(ie).safeParse({ registration: IRISH_REG }).success).toBe(true);
  });

  it("rejects the other market's plate format", () => {
    expect(vehicleLookupRequestSchemaFor(ie).safeParse({ registration: UK_REG }).success).toBe(false);
    expect(vehicleLookupRequestSchemaFor(uk).safeParse({ registration: IRISH_REG }).success).toBe(false);
  });

  it("reports the country it resolved, not one the caller chose", () => {
    const parsed = vehicleLookupRequestSchemaFor(ie).parse({ registration: IRISH_REG });
    expect(parsed.country).toBe("ie");
    expect(vehicleLookupRequestSchemaFor(uk).parse({ registration: UK_REG }).country).toBe("uk");
  });

  /**
   * The web form is not the only caller — anyone can post to the API directly.
   * The country must come from the deployment's configuration, so a UK plate
   * cannot be looked up against the Irish market by asking nicely.
   */
  it("never honours a country the market may not search", () => {
    // Ireland searches only the Irish register, whatever the body claims.
    const irishMarket = vehicleLookupRequestSchemaFor(ie);
    expect(irishMarket.safeParse({ registration: UK_REG, country: "uk" }).success).toBe(false);
    expect(irishMarket.parse({ registration: IRISH_REG, country: "uk" }).country).toBe("ie");
  });

  it("honours a country the market is allowed to search", () => {
    // The UK market may search Ireland, so "country" is meaningful there.
    const ukMarket = vehicleLookupRequestSchemaFor(uk);
    expect(ukMarket.parse({ registration: IRISH_REG, country: "ie" }).country).toBe("ie");
    expect(ukMarket.parse({ registration: UK_REG }).country).toBe("uk");
    // ...but only when the plate matches the register asked for.
    expect(ukMarket.safeParse({ registration: UK_REG, country: "ie" }).success).toBe(false);
  });

  it("normalises the registration the way the register writes it", () => {
    expect(vehicleLookupRequestSchemaFor(ie).parse({ registration: "161-d-12345" }).registration).toBe("161D12345");
    expect(vehicleLookupRequestSchemaFor(uk).parse({ registration: "yd66 txp" }).registration).toBe("YD66TXP");
  });

  it("uses the market's own wording when the plate does not fit", () => {
    const result = vehicleLookupRequestSchemaFor(ie).safeParse({ registration: UK_REG });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain("Irish");
    }
  });
});

const MANUAL_BASE = {
  make: "TESLA",
  model: "MODEL 3",
  colour: "WHITE",
  yearOfManufacture: 2026,
  fuelType: "Electric" as const,
  vehicleType: "car" as const,
  detailsDeclared: true as const,
};

describe("manualVehicleEntrySchemaFor — the market fixes the country", () => {
  it("accepts its own market's plate format", () => {
    expect(
      manualVehicleEntrySchemaFor(ie).safeParse({ ...MANUAL_BASE, registration: IRISH_REG }).success
    ).toBe(true);
    expect(
      manualVehicleEntrySchemaFor(uk).safeParse({ ...MANUAL_BASE, registration: UK_REG }).success
    ).toBe(true);
  });

  it("rejects the other market's plate format", () => {
    expect(
      manualVehicleEntrySchemaFor(ie).safeParse({ ...MANUAL_BASE, registration: UK_REG }).success
    ).toBe(false);
    expect(
      manualVehicleEntrySchemaFor(uk).safeParse({ ...MANUAL_BASE, registration: IRISH_REG }).success
    ).toBe(false);
  });

  it("ignores a country the market may not search", () => {
    const parsed = manualVehicleEntrySchemaFor(ie).parse({
      ...MANUAL_BASE,
      registration: IRISH_REG,
      country: "uk",
    });
    expect(parsed.country).toBe("ie");
  });

  it("still requires the accuracy declaration", () => {
    expect(
      manualVehicleEntrySchemaFor(ie).safeParse({
        ...MANUAL_BASE,
        registration: IRISH_REG,
        detailsDeclared: false,
      }).success
    ).toBe(false);
  });

  it("still requires every vehicle field", () => {
    for (const field of ["make", "model", "colour", "yearOfManufacture", "fuelType", "vehicleType"]) {
      const { [field]: _omitted, ...rest } = { ...MANUAL_BASE, registration: IRISH_REG } as Record<
        string,
        unknown
      >;
      expect(manualVehicleEntrySchemaFor(ie).safeParse(rest).success).toBe(false);
    }
  });
});

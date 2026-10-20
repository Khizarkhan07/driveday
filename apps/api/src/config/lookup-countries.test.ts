import {
  COUNTRY_PLATES,
  manualVehicleEntrySchemaFor,
  marketFor,
  resolveLookupCountry,
  vehicleLookupRequestSchemaFor,
} from "@motorcover/shared-types";
import { describe, expect, it } from "vitest";

const uk = marketFor("uk");
const ie = marketFor("ie");

const UK_REG = "YD66TXP";
const IRISH_REG = "161-D-12345";

describe("which registers each market may search", () => {
  // The UK site has always let a customer tick "this is an Irish registration".
  it("lets the UK market search both registers, defaulting to UK", () => {
    expect(uk.lookupCountries).toEqual(["uk", "ie"]);
    expect(uk.lookupCountries[0]).toBe("uk");
  });

  // Ireland has its own site with its own documents; it never searches the UK.
  it("locks the Irish market to the Irish register", () => {
    expect(ie.lookupCountries).toEqual(["ie"]);
  });
});

describe("resolveLookupCountry", () => {
  it("falls back to the market default when nothing is requested", () => {
    expect(resolveLookupCountry(uk, undefined)).toBe("uk");
    expect(resolveLookupCountry(ie, undefined)).toBe("ie");
  });

  it("honours a country the market is allowed to search", () => {
    expect(resolveLookupCountry(uk, "ie")).toBe("ie");
    expect(resolveLookupCountry(uk, "uk")).toBe("uk");
  });

  // The request body is not trusted: a market can only ever search a register
  // its own configuration permits.
  it("ignores a country the market may not search", () => {
    expect(resolveLookupCountry(ie, "uk")).toBe("ie");
  });
});

describe("vehicle lookup — UK market may search either register", () => {
  const schema = vehicleLookupRequestSchemaFor(uk);

  it("accepts a UK plate by default", () => {
    expect(schema.parse({ registration: UK_REG }).country).toBe("uk");
  });

  it("accepts an Irish plate when Ireland is requested", () => {
    const parsed = schema.parse({ registration: IRISH_REG, country: "ie" });
    expect(parsed.country).toBe("ie");
    expect(parsed.registration).toBe("161D12345");
  });

  it("rejects an Irish plate when Ireland is not requested", () => {
    expect(schema.safeParse({ registration: IRISH_REG }).success).toBe(false);
  });

  it("rejects a UK plate when Ireland is requested", () => {
    expect(schema.safeParse({ registration: UK_REG, country: "ie" }).success).toBe(false);
  });

  it("reports the message for the register actually searched", () => {
    const irish = schema.safeParse({ registration: UK_REG, country: "ie" });
    expect(irish.success).toBe(false);
    if (!irish.success) expect(irish.error.issues[0]?.message).toContain("Irish");

    const british = schema.safeParse({ registration: IRISH_REG });
    expect(british.success).toBe(false);
    if (!british.success) expect(british.error.issues[0]?.message).toContain("UK");
  });
});

describe("vehicle lookup — Irish market stays locked to Ireland", () => {
  const schema = vehicleLookupRequestSchemaFor(ie);

  it("accepts an Irish plate", () => {
    expect(schema.parse({ registration: IRISH_REG }).country).toBe("ie");
  });

  it("refuses a UK plate even when the request asks for the UK register", () => {
    expect(schema.safeParse({ registration: UK_REG, country: "uk" }).success).toBe(false);
  });

  it("reports the Irish message whatever the request claims", () => {
    const r = schema.safeParse({ registration: UK_REG, country: "uk" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.message).toContain("Irish");
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

describe("manual entry follows the same rules", () => {
  it("lets the UK market enter an Irish vehicle manually", () => {
    const parsed = manualVehicleEntrySchemaFor(uk).parse({
      ...MANUAL_BASE,
      registration: IRISH_REG,
      country: "ie",
    });
    expect(parsed.country).toBe("ie");
    expect(parsed.registration).toBe("161D12345");
  });

  it("still refuses an Irish plate on the UK market without the Irish option", () => {
    expect(
      manualVehicleEntrySchemaFor(uk).safeParse({ ...MANUAL_BASE, registration: IRISH_REG }).success
    ).toBe(false);
  });

  // Manual entry was the obvious way around the lookup restriction.
  it("refuses a UK plate on the Irish market however the request is framed", () => {
    expect(
      manualVehicleEntrySchemaFor(ie).safeParse({
        ...MANUAL_BASE,
        registration: UK_REG,
        country: "uk",
      }).success
    ).toBe(false);
  });
});

describe("plate styling per register", () => {
  it("describes each country's plate so the form can show the right one", () => {
    expect(COUNTRY_PLATES.uk.badgeLabel).toBe("UK");
    expect(COUNTRY_PLATES.ie.badgeLabel).toBe("IRL");
    expect(COUNTRY_PLATES.uk.placeholder).toBe("AB12 CDE");
    expect(COUNTRY_PLATES.ie.placeholder).toBe("161-D-12345");
    expect(COUNTRY_PLATES.ie.maxLength).toBeGreaterThan(COUNTRY_PLATES.uk.maxLength);
  });

  it("gives every searchable country a plate definition", () => {
    for (const market of [uk, ie]) {
      for (const country of market.lookupCountries) {
        expect(COUNTRY_PLATES[country]).toBeDefined();
      }
    }
  });
});

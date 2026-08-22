import { describe, expect, it } from "vitest";
import {
  irishRegistrationSchema,
  normalizeRegistration,
  ukRegistrationSchema,
  vehicleLookupRequestSchema,
} from "@motorcover/shared-types";
import {
  extractVehicleJson,
  mapRegCheckResponse,
  unwrap,
} from "./regcheck-ireland-provider";

/** Real response captured from RegCheck for 04MH8917. */
const REAL_XML = `<?xml version="1.0" encoding="utf-8"?>
<Vehicle xmlns="http://regcheck.org.uk">
  <vehicleJson>{
  "Description": "AUDI A6 1.9 TDI SE 130BHP 4DR A",
  "RegistrationYear": "2004",
  "CarMake": { "CurrentTextValue": "AUDI" },
  "CarModel": { "CurrentTextValue": "A6" },
  "BodyStyle": { "CurrentTextValue": "SALOON" },
  "Transmission": { "CurrentTextValue": "" },
  "FuelType": { "CurrentTextValue": "DIESEL" },
  "EngineSize": { "CurrentTextValue": "1896" },
  "VIN": "WAUZZZ4BX4N093080",
  "County": "Meath"
}</vehicleJson>
</Vehicle>`;

describe("normalizeRegistration", () => {
  it("strips the separators people actually type", () => {
    expect(normalizeRegistration("161-D-12345")).toBe("161D12345");
    expect(normalizeRegistration("ab12 cde")).toBe("AB12CDE");
    expect(normalizeRegistration("  04-mh-8917 ")).toBe("04MH8917");
  });
});

describe("irishRegistrationSchema", () => {
  it.each(["04MH8917", "161-D-12345", "12-D-1", "241-KE-99999", "99-C-1234"])(
    "accepts %s",
    (reg) => expect(irishRegistrationSchema.safeParse(reg).success).toBe(true)
  );

  it.each(["", "LR21ZTF", "D-161-12345", "1611D12345", "161D1234567"])(
    "rejects %s",
    (reg) => expect(irishRegistrationSchema.safeParse(reg).success).toBe(false)
  );
});

describe("ukRegistrationSchema", () => {
  it("now accepts lowercase and spaces, which real users type", () => {
    expect(ukRegistrationSchema.parse("yd66 txp")).toBe("YD66TXP");
  });

  it("still rejects an Irish plate", () => {
    expect(ukRegistrationSchema.safeParse("161-D-12345").success).toBe(false);
  });
});

describe("vehicleLookupRequestSchema", () => {
  it("defaults to the UK when no country is given", () => {
    const parsed = vehicleLookupRequestSchema.parse({ registration: "YD66TXP" });
    expect(parsed.country).toBe("uk");
  });

  it("validates against the Irish format when country is ie", () => {
    const ok = vehicleLookupRequestSchema.safeParse({ registration: "161-D-12345", country: "ie" });
    expect(ok.success).toBe(true);
    if (ok.success) expect(ok.data.registration).toBe("161D12345");
  });

  it("rejects a UK plate submitted as Irish", () => {
    expect(vehicleLookupRequestSchema.safeParse({ registration: "YD66TXP", country: "ie" }).success).toBe(false);
  });

  it("rejects an Irish plate submitted as UK", () => {
    expect(vehicleLookupRequestSchema.safeParse({ registration: "161-D-12345", country: "uk" }).success).toBe(false);
  });
});

describe("unwrap", () => {
  it("pulls the value out of a CurrentTextValue wrapper", () => {
    expect(unwrap({ CurrentTextValue: "AUDI" })).toBe("AUDI");
  });

  it("treats blank wrapped values as absent", () => {
    expect(unwrap({ CurrentTextValue: "" })).toBeUndefined();
    expect(unwrap({ CurrentTextValue: "   " })).toBeUndefined();
  });

  it("passes through plain scalars", () => {
    expect(unwrap("Meath")).toBe("Meath");
    expect(unwrap(1896)).toBe("1896");
  });

  it("handles null and undefined", () => {
    expect(unwrap(null)).toBeUndefined();
    expect(unwrap(undefined)).toBeUndefined();
  });
});

describe("extractVehicleJson + mapRegCheckResponse", () => {
  it("maps the real captured response", () => {
    const result = mapRegCheckResponse(extractVehicleJson(REAL_XML), "04MH8917");
    expect(result).toEqual({
      registration: "04MH8917",
      source: "regcheck",
      make: "AUDI",
      model: "A6",
      colour: undefined,
      yearOfManufacture: 2004,
      fuelType: "DIESEL",
      vehicleType: "car",
    });
  });

  it("throws when the envelope has no vehicleJson", () => {
    expect(() => extractVehicleJson("<Vehicle></Vehicle>")).toThrow(/vehicleJson/);
  });

  it("falls back to UNKNOWN make rather than failing the lookup", () => {
    const r = mapRegCheckResponse({}, "161D12345");
    expect(r.make).toBe("UNKNOWN");
    expect(r.vehicleType).toBe("car");
  });

  it("leaves colour undefined — RegCheck does not return it", () => {
    expect(mapRegCheckResponse(extractVehicleJson(REAL_XML), "04MH8917").colour).toBeUndefined();
  });
});

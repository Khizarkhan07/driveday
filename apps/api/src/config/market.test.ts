import {
  MARKET_CODES,
  formatMoney,
  marketFor,
  resolveMarket,
} from "@motorcover/shared-types";
import { describe, expect, it } from "vitest";

describe("resolveMarket", () => {
  it("resolves each supported market code", () => {
    expect(resolveMarket("uk").code).toBe("uk");
    expect(resolveMarket("ie").code).toBe("ie");
  });

  it("accepts surrounding whitespace and upper case, as env vars often carry", () => {
    expect(resolveMarket(" IE ").code).toBe("ie");
    expect(resolveMarket("UK").code).toBe("uk");
  });

  // The whole point of this function. A deployment with a missing or misspelled
  // MARKET must fail at boot rather than quietly serving the other market's
  // currency, register and plate format.
  it("throws when the value is missing", () => {
    expect(() => resolveMarket(undefined)).toThrow(/MARKET must be one of uk, ie/);
    expect(() => resolveMarket(undefined)).toThrow(/received nothing/);
  });

  it("throws on an unrecognised value rather than defaulting", () => {
    for (const bad of ["", "eire", "gb", "ireland", "uk,ie"]) {
      expect(() => resolveMarket(bad)).toThrow(/MARKET must be one of/);
    }
  });

  it("names the offending value so the misconfiguration is obvious", () => {
    expect(() => resolveMarket("eire")).toThrow(/"eire"/);
  });
});

describe("market configuration", () => {
  it("fixes the lookup country per market", () => {
    expect(marketFor("uk").country).toBe("uk");
    expect(marketFor("ie").country).toBe("ie");
  });

  it("prices both cover types the same figures in each market's currency", () => {
    expect(marketFor("uk").currency).toBe("gbp");
    expect(marketFor("ie").currency).toBe("eur");
    for (const code of MARKET_CODES) {
      expect(marketFor(code).coverTypeRates).toEqual({ PERSONAL: 1500, BUSINESS: 2500 });
    }
  });

  it("keeps the original UK policy number format by using no prefix", () => {
    expect(marketFor("uk").policyNumberPrefix).toBeNull();
    expect(marketFor("ie").policyNumberPrefix).toBe("IE");
  });

  it("validates UK licence numbers but does not invent an Irish format", () => {
    const uk = marketFor("uk");
    expect(uk.licencePattern?.test("MORGA753116SM9IJ")).toBe(true);
    expect(uk.licencePattern?.test("12345678")).toBe(false);
    expect(marketFor("ie").licencePattern).toBeNull();
  });

  it("labels the postal code field as each market's drivers would expect", () => {
    expect(marketFor("uk").postalCodeLabel).toBe("Postcode");
    expect(marketFor("ie").postalCodeLabel).toBe("Eircode");
  });

  it("defines every market in MARKET_CODES", () => {
    for (const code of MARKET_CODES) {
      expect(marketFor(code).code).toBe(code);
    }
  });
});

describe("formatMoney", () => {
  it("formats sterling and euro with their symbols", () => {
    expect(formatMoney(1500, "gbp")).toBe("£15.00");
    expect(formatMoney(2500, "eur")).toBe("€25.00");
  });

  it("accepts the currency in any case, as Stripe and the database may store it", () => {
    expect(formatMoney(1500, "GBP")).toBe("£15.00");
    expect(formatMoney(2500, "EUR")).toBe("€25.00");
  });

  it("always shows two decimal places", () => {
    expect(formatMoney(0, "gbp")).toBe("£0.00");
    expect(formatMoney(5, "gbp")).toBe("£0.05");
    expect(formatMoney(100000, "eur")).toBe("€1000.00");
  });

  // A quote row carries a plain string, so an unexpected currency can reach
  // here. Showing a bare number would misrepresent the amount; naming the
  // currency is wrong-looking but honest.
  it("falls back to naming an unknown currency rather than dropping it", () => {
    expect(formatMoney(1500, "usd")).toBe("USD 15.00");
  });
});

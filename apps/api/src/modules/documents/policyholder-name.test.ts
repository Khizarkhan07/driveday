import { describe, expect, it } from "vitest";
import { policyholderName } from "./service";

const account = { firstName: "Abraham", lastName: "Wright", email: "umarkhaliq87@gmail.com" };

describe("policyholderName", () => {
  /**
   * The regression: documents took the name from the account holder, so a
   * certificate for Fabio (the driver) was printed in Abraham's name (the
   * buyer) over Fabio's licence, DOB and address.
   */
  it("uses the driver from the quote, not the account holder", () => {
    const driver = { firstName: "Fabio", lastName: "Sousa-Goncalves" };
    expect(policyholderName(driver, account)).toBe("Fabio Sousa-Goncalves");
  });

  it("uses the driver even when it matches the account holder", () => {
    expect(policyholderName({ firstName: "Abraham", lastName: "Wright" }, account)).toBe("Abraham Wright");
  });

  it("trims stray whitespace in driver names", () => {
    expect(policyholderName({ firstName: " Dennis ", lastName: " Edwards " }, account)).toBe("Dennis Edwards");
  });

  it("collapses a double space inside the stored name", () => {
    // Real data: this customer is stored as "Dennis  Edwards".
    expect(policyholderName({ firstName: "Dennis ", lastName: " Edwards" }, account)).toBe("Dennis Edwards");
  });

  it("copes with only a first name on the quote", () => {
    expect(policyholderName({ firstName: "Fabio" }, account)).toBe("Fabio");
  });

  it("falls back to the account name when the driver has none", () => {
    expect(policyholderName({}, account)).toBe("Abraham Wright");
    expect(policyholderName(null, account)).toBe("Abraham Wright");
    expect(policyholderName(undefined, account)).toBe("Abraham Wright");
  });

  it("falls back to the account email when neither has a name", () => {
    expect(policyholderName({}, { firstName: null, lastName: null, email: "x@y.com" })).toBe("x@y.com");
  });

  it("never returns an empty string", () => {
    expect(policyholderName({ firstName: "", lastName: "" }, account)).not.toBe("");
  });
});

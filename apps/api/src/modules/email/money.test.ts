import { describe, expect, it } from "vitest";
import { renderPolicyConfirmationEmail, renderQuoteSavedEmail } from "./templates";

const CONFIRMATION = {
  firstName: "Test",
  policyNumber: "Policy-2023-000123",
  registration: "AB12CDE",
  vehicleMakeModel: "FORD TRANSIT",
  startDate: "2026-09-01T12:00:00.000Z",
  endDate: "2026-09-02T12:00:00.000Z",
  totalPence: 1500,
  portalUrl: "https://example.test/portal",
};

const QUOTE_SAVED = {
  firstName: "Test",
  registration: "AB12CDE",
  totalPence: 1500,
  resumeUrl: "https://example.test/resume",
};

describe("policy confirmation email — currency", () => {
  it("prints sterling for a sterling quote", () => {
    const html = renderPolicyConfirmationEmail({ ...CONFIRMATION, currency: "gbp" });
    expect(html).toContain("£15.00");
    expect(html).not.toContain("€");
  });

  it("prints euro for a euro quote", () => {
    const html = renderPolicyConfirmationEmail({ ...CONFIRMATION, currency: "eur" });
    expect(html).toContain("€15.00");
    expect(html).not.toContain("£");
  });
});

describe("quote saved email — currency", () => {
  it("prints sterling for a sterling quote", () => {
    const html = renderQuoteSavedEmail({ ...QUOTE_SAVED, currency: "gbp" });
    expect(html).toContain("£15.00");
    expect(html).not.toContain("€");
  });

  it("prints euro for a euro quote", () => {
    const html = renderQuoteSavedEmail({ ...QUOTE_SAVED, currency: "eur" });
    expect(html).toContain("€15.00");
    expect(html).not.toContain("£");
  });
});

/**
 * An email is sent about a quote that was priced at some point in the past.
 * It must report the currency that quote was priced in, not whichever market
 * happens to be sending the mail.
 */
describe("emails report the stored currency, not the live market", () => {
  it("honours a euro quote even though the test process is configured as the UK market", () => {
    expect(renderPolicyConfirmationEmail({ ...CONFIRMATION, currency: "eur" })).toContain("€15.00");
  });
});

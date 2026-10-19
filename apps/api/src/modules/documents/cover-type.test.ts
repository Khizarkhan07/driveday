import { describe, expect, it } from "vitest";
import { documentText } from "./document-text";
import { CertificateDocument } from "./templates/CertificateDocument";
import { PolicyWordingDocument } from "./templates/PolicyWordingDocument";

const CERT_PROPS = {
  policyNumber: "Policy-2026-000123",
  policyholderName: "Test Driver",
  vehicleRegistration: "AB12CDE",
  vehicleDescription: "FORD TRANSIT",
  startDate: "01/09/2026 12:00",
  endDate: "02/09/2026 12:00",
};

const BUSINESS_LIMITATION =
  "Business use for the transportation of goods for Hire and Reward whilst working for: JUST EAT, DELIVEROO, UBER EATS";
const PERSONAL_LIMITATION = "Use for Social Domestic and Pleasure Purposes";

function wordingText(coverType?: "PERSONAL" | "BUSINESS"): string {
  return documentText(PolicyWordingDocument, coverType ? { coverType } : {});
}

function certificateText(coverType?: "PERSONAL" | "BUSINESS"): string {
  return documentText(CertificateDocument, coverType ? { ...CERT_PROPS, coverType } : CERT_PROPS);
}

describe("policy wording — cover type", () => {
  it("omits the business section for personal cover", () => {
    const text = wordingText("PERSONAL");
    expect(text).not.toContain("Business Use");
    expect(text).not.toContain("DELIVEROO");
  });

  it("includes the business limitations and exclusions for business cover", () => {
    const text = wordingText("BUSINESS");
    expect(text).toContain("Business Use — Limitations and Exclusions");
    expect(text).toContain(BUSINESS_LIMITATION);
    expect(text).toContain("For Social Domestic and Pleasure use including commuting");
    expect(text).toContain("Racing, pacemaking, speed testing");
    expect(text).toContain("For the carriage of passengers for hire or reward");
  });

  it("lists the business section in the contents only for business cover", () => {
    expect(wordingText("BUSINESS")).toContain("Business Use — Limitations and Exclusions");
    expect(wordingText("PERSONAL")).not.toContain("Business Use");
  });

  it("defaults to personal when no cover type is given", () => {
    expect(wordingText()).not.toContain("DELIVEROO");
  });

  it("keeps the standard sections under both cover types", () => {
    for (const text of [wordingText("PERSONAL"), wordingText("BUSINESS")]) {
      expect(text).toContain("Section 1 — Liability to Others");
      expect(text).toContain("General Exclusions");
    }
  });
});

describe("certificate — limitations as to use", () => {
  it("states the standard social/domestic/pleasure limitation for personal cover", () => {
    const text = certificateText("PERSONAL");
    expect(text).toContain(PERSONAL_LIMITATION);
    expect(text).not.toContain("DELIVEROO");
  });

  it("replaces it with the business limitation for business cover", () => {
    const text = certificateText("BUSINESS");
    expect(text).toContain(BUSINESS_LIMITATION);
    // Must be replaced, not supplemented — a business certificate that still
    // claims social/domestic/pleasure use contradicts the product sold.
    expect(text).not.toContain(PERSONAL_LIMITATION);
  });

  it("excludes hire and reward on a personal certificate", () => {
    expect(certificateText("PERSONAL")).toContain("passengers or goods for hire or reward");
  });

  it("defaults to personal when no cover type is given", () => {
    expect(certificateText()).toContain(PERSONAL_LIMITATION);
  });

  it("keeps the confiscated-vehicle exclusion under both cover types", () => {
    const clause = "confiscated, seized or impounded";
    expect(certificateText("PERSONAL")).toContain(clause);
    expect(certificateText("BUSINESS")).toContain(clause);
  });
});

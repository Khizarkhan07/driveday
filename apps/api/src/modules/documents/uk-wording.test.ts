import { describe, expect, it } from "vitest";
import { documentText } from "./document-text";
import { CertificateDocument } from "./templates/CertificateDocument";
import { IpidDocument } from "./templates/IpidDocument";
import { PolicyScheduleDocument } from "./templates/PolicyScheduleDocument";
import { PolicyWordingDocument } from "./templates/PolicyWordingDocument";
import { TermsOfBusinessDocument } from "./templates/TermsOfBusinessDocument";

/**
 * A guard on the UK market's document wording, established before the
 * multi-market refactor touched any template.
 *
 * The UK product is live and regulated, so the refactor must be invisible to a
 * UK customer. These assertions are deliberately about regulatory substance —
 * the regulator, the underwriter, the governing law, the territorial limits,
 * the money — rather than layout, so they fail loudly if a market change
 * leaks into UK wording and stay quiet for cosmetic edits.
 *
 * If one of these fails, do not "update the expectation" without establishing
 * that the UK wording was *meant* to change.
 */

const CERT_PROPS = {
  policyNumber: "Policy-2023-000123",
  policyholderName: "Test Driver",
  vehicleRegistration: "AB12CDE",
  vehicleDescription: "FORD TRANSIT",
  startDate: "01/09/2026 12:00",
  endDate: "02/09/2026 12:00",
};

const SCHEDULE_PROPS = {
  ...CERT_PROPS,
  insuredAddress: "1 Test Street\nTestville\nAB1 2CD",
  premium: "£15.00",
  dateOfIssue: "01/09/2026",
};

const IPID_PROPS = {
  policyNumber: "Policy-2023-000123",
  policyholderName: "Test Driver",
  userEmail: "driver@example.com",
  addressLine1: "1 Test Street",
  city: "Testville",
  postcode: "AB1 2CD",
  dateOfBirth: "01/01/1990",
  yearsHeldLicence: 5,
  vehicleRegistration: "AB12CDE",
  vehicleMake: "FORD",
  vehicleModel: "TRANSIT",
  startDate: "01/09/2026",
  startTime: "12:00",
  durationDays: 1,
};

describe("UK wording guard — regulator and underwriter", () => {
  it("names the FCA and its firm reference on the certificate", () => {
    const text = documentText(CertificateDocument, CERT_PROPS);
    expect(text).toContain("Authorised and regulated by the Financial Conduct Authority");
    expect(text).toContain("751221");
  });

  it("names the underwriter and its England and Wales registration", () => {
    for (const text of [
      documentText(CertificateDocument, CERT_PROPS),
      documentText(PolicyScheduleDocument, SCHEDULE_PROPS),
    ]) {
      expect(text).toContain("Highway Insurance Company Limited");
      expect(text).toContain("registered in England and Wales number 3730662");
    }
  });

  it("keeps the underwriter as the data controller and as 'we' in the wording", () => {
    const text = documentText(PolicyWordingDocument, { coverType: "PERSONAL" });
    expect(text).toContain("Highway Insurance Company Limited is the controller of personal information");
    expect(text).toContain("We, our, us");
  });
});

describe("UK wording guard — law and territory", () => {
  it("applies English law in the policy wording", () => {
    const text = documentText(PolicyWordingDocument, { coverType: "PERSONAL" });
    expect(text).toContain("English Law will apply");
  });

  it("states the Great Britain geographical limits", () => {
    const text = documentText(PolicyWordingDocument, { coverType: "PERSONAL" });
    expect(text).toContain("Great Britain, Northern Ireland, the Isle of Man and the Channel Islands");
  });

  it("states the UK country of issue and UK vehicle conditions on the IPID", () => {
    const text = documentText(IpidDocument, IPID_PROPS);
    expect(text).toContain("Country of Issue:");
    expect(text).toContain("Is registered in Great Britain, Northern Ireland or the Isle of Man");
    expect(text).toContain("Will be in the UK at the start of the policy");
  });
});

describe("UK wording guard — money and tax", () => {
  it("prints the premium in pounds on the schedule, inclusive of IPT", () => {
    const text = documentText(PolicyScheduleDocument, SCHEDULE_PROPS);
    expect(text).toContain("£15.00");
    expect(text).toContain("(Including Insurance Premium Tax)");
  });

  it("keeps the sterling policy limits and excesses", () => {
    expect(documentText(PolicyScheduleDocument, SCHEDULE_PROPS)).toContain("£500");
    const wording = documentText(PolicyWordingDocument, { coverType: "PERSONAL" });
    expect(wording).toContain("£20,000,000");
    expect(wording).toContain("£5,000,000");
    expect(documentText(IpidDocument, IPID_PROPS)).toContain("£65,000");
  });

  it("keeps the IPT statements in the terms of business", () => {
    const text = documentText(TermsOfBusinessDocument);
    expect(text).toContain("Insurance Premium Tax");
    expect(text).toContain("£25.00");
  });
});

describe("UK wording guard — no Irish wording leaks in", () => {
  const allDocuments = () => [
    documentText(CertificateDocument, CERT_PROPS),
    documentText(PolicyScheduleDocument, SCHEDULE_PROPS),
    documentText(IpidDocument, IPID_PROPS),
    documentText(PolicyWordingDocument, { coverType: "PERSONAL" }),
    documentText(PolicyWordingDocument, { coverType: "BUSINESS" }),
    documentText(TermsOfBusinessDocument),
  ];

  it("never names the Irish regulator or Irish schemes in a UK document", () => {
    for (const text of allDocuments()) {
      expect(text).not.toContain("Central Bank of Ireland");
      expect(text).not.toContain("Financial Services and Pensions Ombudsman");
      expect(text).not.toContain("Insurance Compensation Fund");
      expect(text).not.toContain("Motor Insurers' Bureau of Ireland");
    }
  });

  it("never prints euro amounts in a UK document", () => {
    for (const text of allDocuments()) {
      expect(text).not.toContain("€");
    }
  });
});

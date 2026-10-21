import { marketFor } from "@motorcover/shared-types";
import { describe, expect, it } from "vitest";
import { documentText } from "./document-text";
import { CertificateDocument } from "./templates/CertificateDocument";
import { PolicyScheduleDocument } from "./templates/PolicyScheduleDocument";
import { PolicyWordingDocument } from "./templates/PolicyWordingDocument";
import { TermsOfBusinessDocument } from "./templates/TermsOfBusinessDocument";

const uk = marketFor("uk").company;
const ie = marketFor("ie").company;

const LONDON = "37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA";
const DUBLIN = "31-36 Ormond Quay Upper, Dublin, D07 EE37, Ireland";

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

describe("company address — UK market", () => {
  it("prints the London address on every document that carries one", () => {
    expect(documentText(CertificateDocument, { ...CERT_PROPS, company: uk })).toContain(LONDON);
    expect(documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: uk })).toContain(LONDON);
    expect(documentText(TermsOfBusinessDocument, { company: uk })).toContain(LONDON);
    expect(documentText(PolicyWordingDocument, { coverType: "PERSONAL", company: uk })).toContain(LONDON);
  });

  // Live UK documents say "registered address", and that must not change.
  it("calls it a registered address", () => {
    expect(documentText(CertificateDocument, { ...CERT_PROPS, company: uk })).toContain(
      "Registered address"
    );
  });

  it("never leaks the Irish address into a UK document", () => {
    for (const text of [
      documentText(CertificateDocument, { ...CERT_PROPS, company: uk }),
      documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: uk }),
      documentText(TermsOfBusinessDocument, { company: uk }),
      documentText(PolicyWordingDocument, { coverType: "PERSONAL", company: uk }),
    ]) {
      expect(text).not.toContain(DUBLIN);
      expect(text).not.toContain("Ormond Quay");
    }
  });

  // The regression guard renders these without a company prop.
  it("defaults to the UK company when none is given", () => {
    expect(documentText(CertificateDocument, CERT_PROPS)).toContain(LONDON);
    expect(documentText(TermsOfBusinessDocument)).toContain(LONDON);
  });
});

describe("company address — Irish market", () => {
  it("prints the Dublin address on every document that carries one", () => {
    expect(documentText(CertificateDocument, { ...CERT_PROPS, company: ie })).toContain(DUBLIN);
    expect(documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: ie })).toContain(DUBLIN);
    expect(documentText(TermsOfBusinessDocument, { company: ie })).toContain(DUBLIN);
    expect(documentText(PolicyWordingDocument, { coverType: "PERSONAL", company: ie })).toContain(DUBLIN);
  });

  it("never leaves the London address behind", () => {
    for (const text of [
      documentText(CertificateDocument, { ...CERT_PROPS, company: ie }),
      documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: ie }),
      documentText(TermsOfBusinessDocument, { company: ie }),
      documentText(PolicyWordingDocument, { coverType: "PERSONAL", company: ie }),
    ]) {
      expect(text).not.toContain(LONDON);
      expect(text).not.toContain("Canada Square");
      expect(text).not.toContain("E14 5AA");
    }
  });

  /**
   * The Irish documents still name a company registered in England and Wales,
   * so calling a Dublin address its *registered* office would contradict them.
   * It is an office address until an Irish entity exists.
   */
  it("calls it an office address, not a registered one", () => {
    const text = documentText(CertificateDocument, { ...CERT_PROPS, company: ie });
    expect(text).toContain("Office address");
    expect(text).not.toContain("Registered address");
  });
});

describe("the market table carries the addresses", () => {
  it("gives each market its own address and wording", () => {
    expect(uk.address).toBe(LONDON);
    expect(ie.address).toBe(DUBLIN);
    expect(uk.addressHeading).toBe("Registered address");
    expect(ie.addressHeading).toBe("Office address");
  });
});

import { marketFor } from "@motorcover/shared-types";
import { describe, expect, it } from "vitest";
import { documentText } from "./document-text";
import { CertificateDocument } from "./templates/CertificateDocument";
import { IpidDocument } from "./templates/IpidDocument";
import { PolicyScheduleDocument } from "./templates/PolicyScheduleDocument";
import { PolicyWordingDocument } from "./templates/PolicyWordingDocument";
import { TermsOfBusinessDocument } from "./templates/TermsOfBusinessDocument";

const uk = marketFor("uk").company;
const ie = marketFor("ie").company;

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

const ukDocs = () => [
  documentText(CertificateDocument, { ...CERT_PROPS, company: uk }),
  documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: uk }),
  documentText(TermsOfBusinessDocument, { company: uk }),
  documentText(PolicyWordingDocument, { coverType: "PERSONAL", company: uk }),
  documentText(IpidDocument, { ...IPID_PROPS, company: uk }),
];

const ieDocs = () => [
  documentText(CertificateDocument, { ...CERT_PROPS, company: ie }),
  documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: ie }),
  documentText(TermsOfBusinessDocument, { company: ie }),
  documentText(PolicyWordingDocument, { coverType: "PERSONAL", company: ie }),
  documentText(IpidDocument, { ...IPID_PROPS, company: ie }),
];

describe("UK documents keep England and Wales", () => {
  it("states Day Drive Ltd's registration with its company number", () => {
    const text = documentText(CertificateDocument, { ...CERT_PROPS, company: uk });
    expect(text).toContain("registered in England and Wales");
    expect(text).toContain("05044963");
  });

  it("states the underwriter's England and Wales registration", () => {
    expect(documentText(CertificateDocument, { ...CERT_PROPS, company: uk })).toContain(
      "Highway Insurance Company Limited, registered in England and Wales number 3730662"
    );
  });

  it("applies the laws and courts of England and Wales", () => {
    const text = documentText(TermsOfBusinessDocument, { company: uk });
    expect(text).toContain("laws of England and Wales");
    expect(text).toContain("courts of England and Wales");
  });

  it("never mentions Ireland as a place of registration", () => {
    for (const text of ukDocs()) {
      expect(text).not.toContain("registered in Ireland");
      expect(text).not.toContain("laws of Ireland");
    }
  });
});

describe("Irish documents say Ireland", () => {
  it("states Day Drive Ltd as registered in Ireland", () => {
    for (const text of [
      documentText(CertificateDocument, { ...CERT_PROPS, company: ie }),
      documentText(PolicyScheduleDocument, { ...SCHEDULE_PROPS, company: ie }),
      documentText(TermsOfBusinessDocument, { company: ie }),
    ]) {
      expect(text).toContain("registered in Ireland");
    }
  });

  /**
   * 05044963 is a Companies House number. No Irish CRO number has been
   * supplied, so the Irish documents omit the number rather than pair an Irish
   * registration with a UK one.
   */
  it("omits the UK company number rather than restating it as Irish", () => {
    for (const text of ieDocs()) {
      expect(text).not.toContain("05044963");
    }
  });

  it("states the underwriter as registered in Ireland", () => {
    expect(documentText(CertificateDocument, { ...CERT_PROPS, company: ie })).toContain(
      "Highway Insurance Company Limited, registered in Ireland"
    );
  });

  it("applies the laws and courts of Ireland", () => {
    const text = documentText(TermsOfBusinessDocument, { company: ie });
    expect(text).toContain("laws of Ireland");
    expect(text).toContain("courts of Ireland");
  });

  it("never leaves England and Wales behind on any Irish document", () => {
    for (const text of ieDocs()) {
      expect(text).not.toContain("England and Wales");
    }
  });
});

describe("the market table carries the jurisdictions", () => {
  it("separates the company, the underwriter and the governing law", () => {
    expect(uk.registrationJurisdiction).toBe("England and Wales");
    expect(ie.registrationJurisdiction).toBe("Ireland");
    expect(uk.underwriterJurisdiction).toBe("England and Wales");
    expect(ie.underwriterJurisdiction).toBe("Ireland");
    expect(uk.governingLaw).toBe("England and Wales");
    expect(ie.governingLaw).toBe("Ireland");
  });

  it("carries a company number only where one is known", () => {
    expect(uk.companyNumber).toBe("05044963");
    expect(ie.companyNumber).toBeNull();
  });
});

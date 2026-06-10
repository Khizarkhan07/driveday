import React from "react";
import { describe, expect, it } from "vitest";
import { renderToBuffer } from "@react-pdf/renderer";
// @ts-expect-error -- pdf-parse has no bundled types
import pdfParse from "pdf-parse";
import { DEMO_DISCLAIMER } from "@motorcover/shared-types";
import { CertificateDocument } from "./templates/CertificateDocument";
import { PolicyScheduleDocument } from "./templates/PolicyScheduleDocument";
import { IpidDocument } from "./templates/IpidDocument";
import { PolicyWordingDocument } from "./templates/PolicyWordingDocument";

/**
 * Regression guard: every document type MUST render the DEMO disclaimer
 * verbatim. If someone ever bypasses DemoDocumentLayout for a new document
 * type, this test catches it before it ships.
 */
/**
 * pdf-parse bundles an old pdf.js build that intermittently throws
 * "bad XRef entry" on a cold parse and then succeeds on the very next
 * call with the *same* buffer — a known library flake, not a sign our
 * generated PDF is malformed. Retry once before failing the test.
 */
async function parseWithRetry(buffer: Buffer): Promise<{ text: string }> {
  try {
    return await pdfParse(buffer);
  } catch {
    return await pdfParse(buffer);
  }
}

async function textOf(element: React.ReactElement): Promise<string> {
  const buffer = await renderToBuffer(element);
  const parsed = await parseWithRetry(buffer);
  return parsed.text as string;
}

describe("generated PDF watermark", () => {
  it("Certificate contains the DEMO disclaimer", async () => {
    const text = await textOf(
      React.createElement(CertificateDocument, {
        policyNumber: "DEMO-2023-000001",
        policyholderName: "Test Person",
        vehicleRegistration: "AB12CDE",
        vehicleDescription: "Ford Fiesta",
        startDate: "1 Jan 2023, 09:00",
        endDate: "2 Jan 2023, 09:00",
      })
    );
    expect(text).toContain(DEMO_DISCLAIMER);
  });

  it("Policy schedule contains the DEMO disclaimer", async () => {
    const text = await textOf(
      React.createElement(PolicyScheduleDocument, {
        policyNumber: "DEMO-2023-000001",
        policyholderName: "Test Person",
        insuredAddress: "1 Test Street\nTest City\nTE1 1ST",
        vehicleRegistration: "AB12CDE",
        vehicleDescription: "Ford Fiesta",
        startDate: "1 Jan 2023, 09:00",
        endDate: "2 Jan 2023, 09:00",
        premium: "£42.00",
        dateOfIssue: "1 Jan 2023, 09:00",
      })
    );
    expect(text).toContain(DEMO_DISCLAIMER);
  });

  it("IPID contains the DEMO disclaimer", async () => {
    const text = await textOf(
      React.createElement(IpidDocument, {
        policyNumber: "DEMO-2023-000001",
        policyholderName: "Test Person",
        userEmail: "test@example.com",
        addressLine1: "1 Test Street",
        city: "Test City",
        postcode: "TE1 1ST",
        dateOfBirth: "01/01/1990",
        yearsHeldLicence: 5,
        vehicleRegistration: "AB12CDE",
        vehicleMake: "Ford",
        vehicleModel: "Fiesta",
        startDate: "01/01/2023",
        startTime: "09:00",
        durationDays: 1,
      })
    );
    expect(text).toContain(DEMO_DISCLAIMER);
  });

  it("Policy wording contains the DEMO disclaimer", async () => {
    const text = await textOf(React.createElement(PolicyWordingDocument));
    expect(text).toContain(DEMO_DISCLAIMER);
  });
});

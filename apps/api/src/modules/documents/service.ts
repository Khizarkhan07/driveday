import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { DocumentType } from "@motorcover/shared-types";
import { prisma, logEvent } from "../../db/client";
import { getDocumentStorage } from "../../providers/storage/factory";
import { CertificateDocument } from "./templates/CertificateDocument";
import { PolicyScheduleDocument } from "./templates/PolicyScheduleDocument";
import { IpidDocument } from "./templates/IpidDocument";
import { PolicyWordingDocument } from "./templates/PolicyWordingDocument";
import { TermsOfBusinessDocument } from "./templates/TermsOfBusinessDocument";

type PdfDocumentElement = Parameters<typeof renderToBuffer>[0];

/**
 * @react-pdf/renderer types `renderToBuffer` to require a `<Document>`
 * element directly, but our templates are function components that *return*
 * one via DemoDocumentLayout (see that file — every template is structurally
 * forced through it). The cast is safe because of that guarantee; this is the
 * single place it lives so it never needs repeating per call site.
 */
function renderDocument(element: React.ReactElement): Promise<Buffer> {
  return renderToBuffer(element as PdfDocumentElement);
}

function formatDate(date: Date): string {
  return date.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDOB(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function formatMoney(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

interface PolicyForDocs {
  id: string;
  policyNumber: string;
  startDate: Date;
  endDate: Date;
  issuedAt: Date | null;
  user: { firstName: string | null; lastName: string | null; email: string };
  quote: {
    totalPence: number;
    durationDays: number;
    driverDetails: unknown;
    vehicle: { registration: string; make: string | null; model: string | null };
  };
}

interface DriverAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
}

function buildAddress(driverDetails: unknown): string {
  const d = driverDetails as DriverAddress;
  return [d.addressLine1, d.addressLine2, d.city, d.postcode].filter(Boolean).join("\n");
}

async function loadPolicy(policyId: string): Promise<PolicyForDocs> {
  const policy = await prisma.policy.findUniqueOrThrow({
    where: { id: policyId },
    include: { user: true, quote: { include: { vehicle: true } } },
  });
  return policy;
}

function policyholderName(user: PolicyForDocs["user"]): string {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
  return name || user.email;
}

function vehicleDescription(vehicle: PolicyForDocs["quote"]["vehicle"]): string {
  return [vehicle.make, vehicle.model].filter(Boolean).join(" ") || "Vehicle details unavailable";
}

async function persistDocument(
  policyId: string,
  type: DocumentType,
  buffer: Buffer
): Promise<{ id: string; storageKey: string }> {
  const storage = getDocumentStorage();
  const storageKey = `policies/${policyId}/${type.toLowerCase()}.pdf`;
  await storage.save(storageKey, buffer, "application/pdf");

  const document = await prisma.document.create({
    data: {
      policyId,
      type,
      storageKey,
      mimeType: "application/pdf",
      watermarked: true,
    },
  });

  await logEvent("Policy", policyId, "document.generated", { type, documentId: document.id });
  return { id: document.id, storageKey };
}

/**
 * Generates all sample documents for a policy, persists them to storage
 * and the database, and returns their buffers (e.g. for emailing as
 * attachments immediately after issuance).
 *
 * Every PDF is composed from DemoDocumentLayout — see that file for why the
 * watermark cannot be omitted — and a regression test asserts the disclaimer
 * text is present in the rendered output of each document type.
 */
export async function generatePolicyDocuments(
  policyId: string
): Promise<Array<{ type: DocumentType; id: string; buffer: Buffer; filename: string }>> {
  const policy = await loadPolicy(policyId);
  const name = policyholderName(policy.user);
  const vehicle = vehicleDescription(policy.quote.vehicle);
  const startDate = formatDate(policy.startDate);
  const endDate = formatDate(policy.endDate);
  const dateOfIssue = formatDate(policy.issuedAt ?? policy.startDate);
  const insuredAddress = buildAddress(policy.quote.driverDetails);
  const dd = policy.quote.driverDetails as {
    addressLine1: string; addressLine2?: string; city: string; postcode: string;
    dateOfBirth: string; licenceNumber: string; yearsHeldLicence: number;
  };

  const certificateBuffer = await renderDocument(
    React.createElement(CertificateDocument, {
      policyNumber: policy.policyNumber,
      policyholderName: name,
      vehicleRegistration: policy.quote.vehicle.registration,
      vehicleDescription: vehicle,
      startDate,
      endDate,
    })
  );

  const scheduleBuffer = await renderDocument(
    React.createElement(PolicyScheduleDocument, {
      policyNumber: policy.policyNumber,
      policyholderName: name,
      insuredAddress,
      vehicleRegistration: policy.quote.vehicle.registration,
      vehicleDescription: vehicle,
      startDate,
      endDate,
      premium: formatMoney(policy.quote.totalPence),
      dateOfIssue,
    })
  );

  const ipidBuffer = await renderDocument(
    React.createElement(IpidDocument, {
      policyNumber: policy.policyNumber,
      policyholderName: name,
      userEmail: policy.user.email,
      addressLine1: dd.addressLine1,
      addressLine2: dd.addressLine2,
      city: dd.city,
      postcode: dd.postcode,
      dateOfBirth: formatDOB(dd.dateOfBirth),
      yearsHeldLicence: dd.yearsHeldLicence,
      vehicleRegistration: policy.quote.vehicle.registration,
      vehicleMake: policy.quote.vehicle.make ?? "—",
      vehicleModel: policy.quote.vehicle.model ?? "—",
      startDate: formatShortDate(policy.startDate),
      startTime: formatTime(policy.startDate),
      durationDays: policy.quote.durationDays,
    })
  );

  const policyWordingBuffer = await renderDocument(
    React.createElement(PolicyWordingDocument)
  );

  const tobaBuffer = await renderDocument(
    React.createElement(TermsOfBusinessDocument)
  );

  const certificate = await persistDocument(policyId, "CERTIFICATE", certificateBuffer);
  const schedule = await persistDocument(policyId, "POLICY_SCHEDULE", scheduleBuffer);
  const ipid = await persistDocument(policyId, "IPID", ipidBuffer);
  const policyWording = await persistDocument(policyId, "POLICY_WORDING", policyWordingBuffer);
  const toba = await persistDocument(policyId, "TERMS_OF_BUSINESS", tobaBuffer);

  return [
    { type: "CERTIFICATE", id: certificate.id, buffer: certificateBuffer, filename: "certificate-of-insurance.pdf" },
    { type: "POLICY_SCHEDULE", id: schedule.id, buffer: scheduleBuffer, filename: "policy-schedule.pdf" },
    { type: "IPID", id: ipid.id, buffer: ipidBuffer, filename: "statement-of-fact.pdf" },
    { type: "POLICY_WORDING", id: policyWording.id, buffer: policyWordingBuffer, filename: "policy-wording.pdf" },
    { type: "TERMS_OF_BUSINESS", id: toba.id, buffer: tobaBuffer, filename: "terms-of-business.pdf" },
  ];
}

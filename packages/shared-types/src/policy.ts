import { z } from "zod";

export const policyStatusSchema = z.enum(["PENDING", "ISSUED", "CANCELLED"]);
export type PolicyStatus = z.infer<typeof policyStatusSchema>;

export const paymentStatusSchema = z.enum([
  "REQUIRES_PAYMENT",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
]);
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;

export const documentTypeSchema = z.enum([
  "CERTIFICATE",
  "POLICY_SCHEDULE",
  "IPID",
  "POLICY_WORDING",
  "TERMS_OF_BUSINESS",
]);
export type DocumentType = z.infer<typeof documentTypeSchema>;

export const policySummarySchema = z.object({
  id: z.string(),
  policyNumber: z.string(),
  status: policyStatusSchema,
  startDate: z.string(),
  endDate: z.string(),
  issuedAt: z.string().nullable(),
  vehicleRegistration: z.string(),
  totalPence: z.number().int(),
});
export type PolicySummary = z.infer<typeof policySummarySchema>;

export const documentSummarySchema = z.object({
  id: z.string(),
  type: documentTypeSchema,
  createdAt: z.string(),
});
export type DocumentSummary = z.infer<typeof documentSummarySchema>;

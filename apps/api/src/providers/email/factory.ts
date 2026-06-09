import { ResendEmailProvider } from "./resend-provider";
import type { EmailProvider } from "./types";

let cached: EmailProvider | undefined;

export function getEmailProvider(): EmailProvider {
  if (!cached) cached = new ResendEmailProvider();
  return cached;
}

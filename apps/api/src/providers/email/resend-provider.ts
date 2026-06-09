import { Resend } from "resend";
import { env } from "../../config/env";
import type { EmailProvider, SendEmailInput } from "./types";

/**
 * Thin wrapper over Resend using the sandbox sender (onboarding@resend.dev).
 *
 * NOTE: the Resend sandbox sender only delivers to the account owner's
 * verified email address — fine for solo demo/testing now. To demo to other
 * people later, verify a real domain in the Resend dashboard and change
 * EMAIL_FROM — no code changes required.
 */
export class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    this.client = new Resend(env.resendApiKey);
  }

  async send(input: SendEmailInput): Promise<{ id: string }> {
    const { data, error } = await this.client.emails.send({
      from: env.emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      attachments: input.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
    });

    if (error) {
      throw new Error(`Resend send failed: ${error.message}`);
    }

    return { id: data?.id ?? "unknown" };
  }
}

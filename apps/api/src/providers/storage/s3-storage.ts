import { env } from "../../config/env";
import type { DocumentStorage } from "./types";

/**
 * S3-compatible storage (works with AWS S3, Cloudflare R2, Backblaze B2, etc
 * — anything speaking the S3 API). Recommended for the deployed demo since
 * Render/Railway local disks don't survive redeploys.
 *
 * Requires the @aws-sdk/client-s3 package (not installed by default to keep
 * the prototype's dependency footprint small — add it when you're ready to
 * switch DOCUMENT_STORAGE=s3):
 *
 *   npm install @aws-sdk/client-s3 --workspace=apps/api
 *
 * Then fill in the TODOs below. Until then, this throws clearly if selected.
 */
export class S3Storage implements DocumentStorage {
  constructor() {
    const missing: string[] = [];
    if (!env.s3Bucket) missing.push("S3_BUCKET");
    if (!env.s3Region) missing.push("S3_REGION");
    if (!env.s3AccessKeyId) missing.push("S3_ACCESS_KEY_ID");
    if (!env.s3SecretAccessKey) missing.push("S3_SECRET_ACCESS_KEY");
    if (missing.length > 0) {
      throw new Error(
        `S3Storage is not configured. Missing env vars: ${missing.join(", ")}. ` +
          `Set DOCUMENT_STORAGE=local to use local disk storage instead, or install ` +
          `@aws-sdk/client-s3 and complete the TODOs in s3-storage.ts.`
      );
    }
  }

  async save(_key: string, _content: Buffer, _contentType: string): Promise<string> {
    // TODO: implement using @aws-sdk/client-s3 PutObjectCommand
    throw new Error(
      "S3Storage.save is not yet implemented — install @aws-sdk/client-s3 and complete this method."
    );
  }

  async read(_key: string): Promise<Buffer> {
    // TODO: implement using @aws-sdk/client-s3 GetObjectCommand
    throw new Error(
      "S3Storage.read is not yet implemented — install @aws-sdk/client-s3 and complete this method."
    );
  }
}

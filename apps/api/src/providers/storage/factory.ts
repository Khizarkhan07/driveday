import { env } from "../../config/env";
import { LocalDiskStorage } from "./local-disk-storage";
import { S3Storage } from "./s3-storage";
import { VercelBlobStorage } from "./vercel-blob-storage";
import type { DocumentStorage } from "./types";

let cached: DocumentStorage | undefined;

export function getDocumentStorage(): DocumentStorage {
  if (cached) return cached;
  if (env.documentStorage === "s3") cached = new S3Storage();
  else if (env.documentStorage === "blob") cached = new VercelBlobStorage();
  else cached = new LocalDiskStorage();
  return cached;
}

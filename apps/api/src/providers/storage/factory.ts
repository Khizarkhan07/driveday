import { env } from "../../config/env";
import { LocalDiskStorage } from "./local-disk-storage";
import { S3Storage } from "./s3-storage";
import type { DocumentStorage } from "./types";

let cached: DocumentStorage | undefined;

export function getDocumentStorage(): DocumentStorage {
  if (cached) return cached;
  cached = env.documentStorage === "s3" ? new S3Storage() : new LocalDiskStorage();
  return cached;
}

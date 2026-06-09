import { promises as fs } from "fs";
import path from "path";
import { env } from "../../config/env";
import type { DocumentStorage } from "./types";

/**
 * Writes documents to a local directory. Fine for local development, but
 * Render/Railway disks are EPHEMERAL across redeploys — use S3Storage
 * (DOCUMENT_STORAGE=s3, e.g. backed by Cloudflare R2's free tier) for the
 * deployed demo so generated certificates survive a redeploy.
 */
export class LocalDiskStorage implements DocumentStorage {
  private rootDir: string;

  constructor() {
    this.rootDir = path.resolve(process.cwd(), env.localDocsDir);
  }

  async save(key: string, content: Buffer): Promise<string> {
    const filePath = path.join(this.rootDir, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content);
    return key;
  }

  async read(key: string): Promise<Buffer> {
    return fs.readFile(path.join(this.rootDir, key));
  }
}

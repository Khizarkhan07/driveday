import { put, getDownloadUrl } from "@vercel/blob";
import type { DocumentStorage } from "./types";

export class VercelBlobStorage implements DocumentStorage {
  async save(key: string, content: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, content, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      // Keys are deterministic (policies/{id}/{type}.pdf), so writing the same
      // key means regenerating that exact document — reissuing a corrected
      // certificate, say. Without this the SDK rejects the write outright.
      allowOverwrite: true,
    });
    return url;
  }

  async read(key: string): Promise<Buffer> {
    const res = await fetch(key);
    if (!res.ok) throw new Error(`Failed to fetch blob: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

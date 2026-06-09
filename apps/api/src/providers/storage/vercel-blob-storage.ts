import { put, getDownloadUrl } from "@vercel/blob";
import type { DocumentStorage } from "./types";

export class VercelBlobStorage implements DocumentStorage {
  async save(key: string, content: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, content, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });
    return url;
  }

  async read(key: string): Promise<Buffer> {
    const res = await fetch(key);
    if (!res.ok) throw new Error(`Failed to fetch blob: ${res.statusText}`);
    return Buffer.from(await res.arrayBuffer());
  }
}

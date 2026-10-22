import { get, put } from "@vercel/blob";
import type { DocumentStorage } from "./types";

export type BlobAccess = "public" | "private";

/**
 * Vercel Blob storage for policy documents.
 *
 * The store's access mode is fixed when the store is created and cannot be
 * changed afterwards, so it is configuration rather than something we can
 * detect: writing a public blob to a private store fails outright with
 * "Cannot use public access on a private store".
 *
 * Private is the better setting for these files — a certificate carries a
 * name, address, date of birth and licence number, and a public blob is
 * readable by anyone holding the URL. The UK store predates this and is
 * public, which is why the mode is configurable rather than simply changed.
 */
export class VercelBlobStorage implements DocumentStorage {
  constructor(private readonly access: BlobAccess = "public") {}

  async save(key: string, content: Buffer, contentType: string): Promise<string> {
    const { url } = await put(key, content, {
      access: this.access,
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
    // A public blob is readable by plain fetch, which is how every UK document
    // stored so far is read. Leaving that path alone keeps those working.
    if (this.access === "public") {
      const res = await fetch(key);
      if (!res.ok) throw new Error(`Failed to fetch blob: ${res.statusText}`);
      return Buffer.from(await res.arrayBuffer());
    }

    // A private blob needs the store token, which `get` takes from
    // BLOB_READ_WRITE_TOKEN in the environment.
    const result = await get(key, { access: "private" });
    if (!result) throw new Error(`Blob not found: ${key}`);
    if (!result.stream) throw new Error(`Blob returned no content (status ${result.statusCode}): ${key}`);
    return Buffer.from(await new Response(result.stream).arrayBuffer());
  }
}

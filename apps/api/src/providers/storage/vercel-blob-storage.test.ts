import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.hoisted so the mocks exist before vi.mock is lifted above the imports;
// a top-level await import would work in Vitest but fails `tsc`, which builds
// the deployment.
const { put, get } = vi.hoisted(() => ({ put: vi.fn(), get: vi.fn() }));
vi.mock("@vercel/blob", () => ({ put, get }));

import { VercelBlobStorage } from "./vercel-blob-storage";

const CONTENT = Buffer.from("%PDF-1.3 pretend");
const KEY = "policies/abc123/certificate.pdf";
const URL = "https://example.public.blob.vercel-storage.com/policies/abc123/certificate.pdf";

beforeEach(() => {
  put.mockReset();
  get.mockReset();
  put.mockResolvedValue({ url: URL });
});

describe("writing", () => {
  /**
   * A store's access mode is fixed at creation. Writing a public blob to a
   * private store fails with "Cannot use public access on a private store",
   * which is how an Irish policy was issued with no documents attached: the
   * payment and the policy succeeded and only post-processing failed.
   */
  it("writes with the access the store was configured for", async () => {
    await new VercelBlobStorage("private").save(KEY, CONTENT, "application/pdf");
    expect(put.mock.calls[0]?.[2]).toMatchObject({ access: "private" });

    put.mockReset();
    put.mockResolvedValue({ url: URL });
    await new VercelBlobStorage("public").save(KEY, CONTENT, "application/pdf");
    expect(put.mock.calls[0]?.[2]).toMatchObject({ access: "public" });
  });

  it("defaults to public, which is what the UK store is", async () => {
    await new VercelBlobStorage().save(KEY, CONTENT, "application/pdf");
    expect(put.mock.calls[0]?.[2]).toMatchObject({ access: "public" });
  });

  it("keeps deterministic keys and allows overwriting a reissued document", async () => {
    await new VercelBlobStorage("private").save(KEY, CONTENT, "application/pdf");
    expect(put.mock.calls[0]?.[2]).toMatchObject({
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/pdf",
    });
  });

  it("returns the stored URL", async () => {
    expect(await new VercelBlobStorage("private").save(KEY, CONTENT, "application/pdf")).toBe(URL);
  });
});

describe("reading", () => {
  it("reads a private blob through the SDK, which carries the store token", async () => {
    get.mockResolvedValue({ statusCode: 200, stream: new Response(CONTENT).body });
    const out = await new VercelBlobStorage("private").read(URL);
    expect(get).toHaveBeenCalledWith(URL, { access: "private" });
    expect(out.equals(CONTENT)).toBe(true);
  });

  // Every UK document stored so far is read this way; it must keep working.
  it("reads a public blob with a plain fetch and never calls the SDK", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(CONTENT));
    const out = await new VercelBlobStorage("public").read(URL);
    expect(fetchSpy).toHaveBeenCalledWith(URL);
    expect(get).not.toHaveBeenCalled();
    expect(out.equals(CONTENT)).toBe(true);
    fetchSpy.mockRestore();
  });

  it("fails loudly when a private blob is missing rather than returning empty content", async () => {
    get.mockResolvedValue(null);
    await expect(new VercelBlobStorage("private").read(URL)).rejects.toThrow(/not found/i);
  });

  it("fails loudly when a private blob returns no body", async () => {
    get.mockResolvedValue({ statusCode: 304, stream: null });
    await expect(new VercelBlobStorage("private").read(URL)).rejects.toThrow(/no content/i);
  });

  it("fails loudly when a public blob cannot be fetched", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("nope", { status: 404, statusText: "Not Found" }));
    await expect(new VercelBlobStorage("public").read(URL)).rejects.toThrow(/Failed to fetch blob/);
    fetchSpy.mockRestore();
  });
});

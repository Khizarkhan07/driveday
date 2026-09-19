import { describe, expect, it } from "vitest";
import { originalPathFrom } from "./vercel-path";

/**
 * Vercel rewrites every incoming request to this function's own path, so the
 * Express app would otherwise see "/api/index" no matter what was requested
 * and match no route. The rewrite forwards the original path as a suffix;
 * this strips the prefix back off so Express routes on what the caller asked
 * for.
 */
describe("originalPathFrom", () => {
  it("restores a plain route", () => {
    expect(originalPathFrom("/api/index/health")).toBe("/health");
  });

  it("restores a nested route", () => {
    expect(originalPathFrom("/api/index/vehicle-lookup/manual")).toBe("/vehicle-lookup/manual");
  });

  it("keeps the query string", () => {
    expect(originalPathFrom("/api/index/admin/policies?search=AB12CDE")).toBe(
      "/admin/policies?search=AB12CDE"
    );
  });

  it("maps the bare function path to the root", () => {
    expect(originalPathFrom("/api/index")).toBe("/");
  });

  it("maps a trailing slash to the root", () => {
    expect(originalPathFrom("/api/index/")).toBe("/");
  });

  it("keeps a query string on the bare function path", () => {
    expect(originalPathFrom("/api/index?foo=bar")).toBe("/?foo=bar");
  });

  it("leaves an unrewritten path alone", () => {
    expect(originalPathFrom("/health")).toBe("/health");
  });

  it("does not strip a route that merely starts with the same text", () => {
    expect(originalPathFrom("/api/indexing")).toBe("/api/indexing");
  });

  it("falls back to the root when there is no url", () => {
    expect(originalPathFrom(undefined)).toBe("/");
  });
});

import { describe, expect, it } from "vitest";
import {
  createdAtFilter,
  dayInputToIso,
  isoToDayInput,
  resolveRange,
} from "@motorcover/shared-types";

/**
 * Ranges are resolved in local time, so assertions compare local calendar
 * fields rather than the ISO string (which shifts with the runner's zone).
 */
function local(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  return {
    y: d.getFullYear(),
    m: d.getMonth() + 1,
    d: d.getDate(),
    h: d.getHours(),
    min: d.getMinutes(),
  };
}

// Wed 12 Aug 2026, mid-quarter (Q3) and mid-month.
const NOW = new Date(2026, 7, 12, 14, 30, 0);

describe("resolveRange", () => {
  it("returns no constraint for allTime", () => {
    expect(resolveRange("allTime", NOW)).toEqual({});
  });

  it("spans today plus the 6 preceding days for last7", () => {
    const r = resolveRange("last7", NOW);
    expect(local(r.from)).toEqual({ y: 2026, m: 8, d: 6, h: 0, min: 0 });
    expect(local(r.to)).toEqual({ y: 2026, m: 8, d: 12, h: 23, min: 59 });
  });

  it("spans today plus the 29 preceding days for last30", () => {
    const r = resolveRange("last30", NOW);
    expect(local(r.from)).toEqual({ y: 2026, m: 7, d: 14, h: 0, min: 0 });
  });

  it("starts thisMonth on the 1st and ends today", () => {
    const r = resolveRange("thisMonth", NOW);
    expect(local(r.from)).toEqual({ y: 2026, m: 8, d: 1, h: 0, min: 0 });
    expect(local(r.to)).toEqual({ y: 2026, m: 8, d: 12, h: 23, min: 59 });
  });

  it("covers the whole of the preceding calendar month for lastMonth", () => {
    const r = resolveRange("lastMonth", NOW);
    expect(local(r.from)).toEqual({ y: 2026, m: 7, d: 1, h: 0, min: 0 });
    expect(local(r.to)).toEqual({ y: 2026, m: 7, d: 31, h: 23, min: 59 });
  });

  it("handles lastMonth across a year boundary", () => {
    const r = resolveRange("lastMonth", new Date(2026, 0, 15));
    expect(local(r.from)).toEqual({ y: 2025, m: 12, d: 1, h: 0, min: 0 });
    expect(local(r.to)).toEqual({ y: 2025, m: 12, d: 31, h: 23, min: 59 });
  });

  it("handles lastMonth landing on a 28-day February", () => {
    const r = resolveRange("lastMonth", new Date(2026, 2, 10));
    expect(local(r.to)).toEqual({ y: 2026, m: 2, d: 28, h: 23, min: 59 });
  });

  it("starts thisQuarter at the quarter boundary", () => {
    // August sits in Q3, which starts 1 July.
    const r = resolveRange("thisQuarter", NOW);
    expect(local(r.from)).toEqual({ y: 2026, m: 7, d: 1, h: 0, min: 0 });
  });

  it.each([
    [0, 1], // Jan -> Q1 starts Jan
    [4, 4], // May -> Q2 starts Apr
    [8, 7], // Sep -> Q3 starts Jul
    [11, 10], // Dec -> Q4 starts Oct
  ])("snaps thisQuarter to the right boundary for month %i", (month, expectedStart) => {
    const r = resolveRange("thisQuarter", new Date(2026, month, 15));
    expect(local(r.from)?.m).toBe(expectedStart);
  });

  it("covers the whole preceding quarter for lastQuarter", () => {
    const r = resolveRange("lastQuarter", NOW); // Q3 -> Q2
    expect(local(r.from)).toEqual({ y: 2026, m: 4, d: 1, h: 0, min: 0 });
    expect(local(r.to)).toEqual({ y: 2026, m: 6, d: 30, h: 23, min: 59 });
  });

  it("rolls lastQuarter back into the previous year from Q1", () => {
    const r = resolveRange("lastQuarter", new Date(2026, 1, 10)); // Feb -> Q4 2025
    expect(local(r.from)).toEqual({ y: 2025, m: 10, d: 1, h: 0, min: 0 });
    expect(local(r.to)).toEqual({ y: 2025, m: 12, d: 31, h: 23, min: 59 });
  });

  it("starts thisYear on 1 January", () => {
    const r = resolveRange("thisYear", NOW);
    expect(local(r.from)).toEqual({ y: 2026, m: 1, d: 1, h: 0, min: 0 });
  });

  it("never produces a range where from is after to", () => {
    const presets = [
      "last7", "last30", "thisMonth", "lastMonth",
      "thisQuarter", "lastQuarter", "thisYear",
    ] as const;
    for (const p of presets) {
      const r = resolveRange(p, NOW);
      expect(new Date(r.from!).getTime()).toBeLessThan(new Date(r.to!).getTime());
    }
  });
});

describe("dayInputToIso / isoToDayInput", () => {
  it("maps a date input to start and end of that local day", () => {
    expect(local(dayInputToIso("2026-08-12", "start"))).toEqual({ y: 2026, m: 8, d: 12, h: 0, min: 0 });
    expect(local(dayInputToIso("2026-08-12", "end"))).toEqual({ y: 2026, m: 8, d: 12, h: 23, min: 59 });
  });

  it("rejects malformed input", () => {
    expect(dayInputToIso("", "start")).toBeUndefined();
    expect(dayInputToIso("12/08/2026", "start")).toBeUndefined();
    expect(dayInputToIso("2026-13-45", "start")).toBeUndefined();
  });

  it("round-trips through isoToDayInput", () => {
    const iso = dayInputToIso("2026-08-12", "start")!;
    expect(isoToDayInput(iso)).toBe("2026-08-12");
  });

  it("returns an empty string for missing or invalid iso", () => {
    expect(isoToDayInput(undefined)).toBe("");
    expect(isoToDayInput("not-a-date")).toBe("");
  });
});

describe("createdAtFilter", () => {
  it("returns undefined when unconstrained", () => {
    expect(createdAtFilter({})).toBeUndefined();
  });

  it("builds gte/lte from the range", () => {
    const f = createdAtFilter({ from: "2026-08-01T00:00:00.000Z", to: "2026-08-31T23:59:59.999Z" });
    expect(f?.gte).toEqual(new Date("2026-08-01T00:00:00.000Z"));
    expect(f?.lte).toEqual(new Date("2026-08-31T23:59:59.999Z"));
  });

  it("supports an open-ended range", () => {
    expect(createdAtFilter({ from: "2026-08-01T00:00:00.000Z" })?.lte).toBeUndefined();
    expect(createdAtFilter({ to: "2026-08-01T00:00:00.000Z" })?.gte).toBeUndefined();
  });
});

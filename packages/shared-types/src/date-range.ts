import { z } from "zod";

/**
 * Date-range filtering for the admin screens.
 *
 * Presets are resolved on the CLIENT against the browser's clock and sent to
 * the API as absolute ISO instants. Resolving server-side would mean doing
 * Europe/London offset maths on every request (the admin UI renders dates in
 * that zone, so a naive UTC midnight misfiles rows during BST) — sending
 * resolved instants keeps the API free of timezone handling entirely.
 */

export type DateRangePreset =
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "thisQuarter"
  | "lastQuarter"
  | "thisYear"
  | "allTime";

export const DATE_RANGE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "last7", label: "Last 7 days" },
  { value: "last30", label: "Last 30 days" },
  { value: "thisMonth", label: "This month" },
  { value: "lastMonth", label: "Last month" },
  { value: "thisQuarter", label: "This quarter" },
  { value: "lastQuarter", label: "Last quarter" },
  { value: "thisYear", label: "This year" },
  { value: "allTime", label: "All time" },
];

/** `from`/`to` are ISO instants. Both undefined means "no constraint". */
export interface DateRange {
  from?: string;
  to?: string;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
const endOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

/**
 * Resolves a preset to a concrete range. `now` is injectable so the behaviour
 * is testable against a frozen clock.
 *
 * Rolling windows ("last 7 days") are inclusive of today, so last7 spans today
 * plus the 6 preceding days. Calendar presets snap to real period boundaries.
 */
export function resolveRange(preset: DateRangePreset, now: Date = new Date()): DateRange {
  const year = now.getFullYear();
  const month = now.getMonth();
  const quarterStartMonth = Math.floor(month / 3) * 3;

  switch (preset) {
    case "allTime":
      return {};

    case "last7":
      return {
        from: startOfDay(new Date(year, month, now.getDate() - 6)).toISOString(),
        to: endOfDay(now).toISOString(),
      };

    case "last30":
      return {
        from: startOfDay(new Date(year, month, now.getDate() - 29)).toISOString(),
        to: endOfDay(now).toISOString(),
      };

    case "thisMonth":
      return {
        from: startOfDay(new Date(year, month, 1)).toISOString(),
        to: endOfDay(now).toISOString(),
      };

    case "lastMonth":
      return {
        // Day 0 of a month is the last day of the month before it.
        from: startOfDay(new Date(year, month - 1, 1)).toISOString(),
        to: endOfDay(new Date(year, month, 0)).toISOString(),
      };

    case "thisQuarter":
      return {
        from: startOfDay(new Date(year, quarterStartMonth, 1)).toISOString(),
        to: endOfDay(now).toISOString(),
      };

    case "lastQuarter":
      return {
        from: startOfDay(new Date(year, quarterStartMonth - 3, 1)).toISOString(),
        to: endOfDay(new Date(year, quarterStartMonth, 0)).toISOString(),
      };

    case "thisYear":
      return {
        from: startOfDay(new Date(year, 0, 1)).toISOString(),
        to: endOfDay(now).toISOString(),
      };
  }
}

/** Converts a `yyyy-mm-dd` value from a native date input into a local-day boundary. */
export function dayInputToIso(value: string, edge: "start" | "end"): string | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  // The Date constructor rolls overflow forward (month 13 becomes January of
  // the next year), so check the parts survived the round-trip.
  const roundTrips =
    date.getFullYear() === Number(y) &&
    date.getMonth() === Number(m) - 1 &&
    date.getDate() === Number(d);
  if (!roundTrips) return undefined;
  return (edge === "start" ? startOfDay(date) : endOfDay(date)).toISOString();
}

/** Converts an ISO instant back to the `yyyy-mm-dd` a native date input expects. */
export function isoToDayInput(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Validates the `from`/`to` query params on admin endpoints. */
export const dateRangeQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

/**
 * Builds a Prisma `createdAt` filter. Returns undefined when unconstrained so
 * callers can spread it into a `where` without emitting an empty clause.
 */
export function createdAtFilter(range: DateRange): { gte?: Date; lte?: Date } | undefined {
  if (!range.from && !range.to) return undefined;
  return {
    ...(range.from ? { gte: new Date(range.from) } : {}),
    ...(range.to ? { lte: new Date(range.to) } : {}),
  };
}

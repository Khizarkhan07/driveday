import { create } from "zustand";
import { resolveRange, type DateRange, type DateRangePreset } from "@motorcover/shared-types";

export interface AdminFilterState {
  /** null when the range was set by picking custom dates rather than a preset. */
  preset: DateRangePreset | null;
  range: DateRange;

  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (range: DateRange) => void;
  clear: () => void;
}

/**
 * The admin date range, shared across the Dashboard and Policies screens so
 * the selection survives navigation between them. Deliberately not persisted —
 * each admin session should start on "all time" rather than inherit a stale
 * window from days ago.
 */
export const useAdminFilterStore = create<AdminFilterState>((set) => ({
  preset: "allTime",
  range: {},

  setPreset: (preset) => set({ preset, range: resolveRange(preset) }),
  setCustomRange: (range) => set({ preset: null, range }),
  clear: () => set({ preset: "allTime", range: {} }),
}));

/** Serialises the range into the query string admin endpoints expect. */
export function rangeQuery(range: DateRange): string {
  const params = new URLSearchParams();
  if (range.from) params.set("from", range.from);
  if (range.to) params.set("to", range.to);
  const qs = params.toString();
  return qs ? `&${qs}` : "";
}

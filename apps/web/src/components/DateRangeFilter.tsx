import {
  DATE_RANGE_PRESETS,
  dayInputToIso,
  isoToDayInput,
  type DateRangePreset,
} from "@motorcover/shared-types";
import { useAdminFilterStore } from "../lib/admin-filter-store";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Europe/London",
  });
}

/**
 * Date range control for the admin screens: preset pills plus custom
 * from/to inputs. Reads and writes the shared admin filter store, so every
 * screen using it stays in sync.
 */
export function DateRangeFilter() {
  const { preset, range, setPreset, setCustomRange } = useAdminFilterStore();

  function handleCustom(edge: "start" | "end", value: string) {
    // An emptied input clears just that side, leaving an open-ended range.
    const iso = value ? dayInputToIso(value, edge) : undefined;
    setCustomRange(edge === "start" ? { ...range, from: iso } : { ...range, to: iso });
  }

  const isActive = (p: DateRangePreset) => preset === p;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {DATE_RANGE_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPreset(p.value)}
            aria-pressed={isActive(p.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition ${
              isActive(p.value)
                ? "bg-mint text-ink border-mint shadow-sm shadow-mint/25"
                : "bg-white text-ink/60 border-ink/15 hover:bg-ink/5 hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <label className="text-ink/45 text-xs uppercase tracking-wider font-semibold">From</label>
        <input
          type="date"
          value={isoToDayInput(range.from)}
          max={isoToDayInput(range.to) || undefined}
          onChange={(e) => handleCustom("start", e.target.value)}
          className="rounded-xl bg-white border border-ink/15 px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint transition"
        />
        <label className="text-ink/45 text-xs uppercase tracking-wider font-semibold">To</label>
        <input
          type="date"
          value={isoToDayInput(range.to)}
          min={isoToDayInput(range.from) || undefined}
          onChange={(e) => handleCustom("end", e.target.value)}
          className="rounded-xl bg-white border border-ink/15 px-3 py-1.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint transition"
        />

        <span className="text-ink/45 text-xs ml-1">
          {range.from || range.to
            ? `${range.from ? fmt(range.from) : "Anything"} → ${range.to ? fmt(range.to) : "now"}`
            : "Showing all time"}
        </span>
      </div>
    </div>
  );
}

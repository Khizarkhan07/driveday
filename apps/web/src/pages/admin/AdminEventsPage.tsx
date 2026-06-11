import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Card } from "../../components/ui";

interface EventRow {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  payload: unknown;
  createdAt: string;
}

interface EventsResponse {
  events: EventRow[];
  total: number;
  page: number;
  pages: number;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" });
}

const ENTITY_TYPES = ["", "User", "Policy", "Payment", "Quote"];

export function AdminEventsPage() {
  const [search, setSearch] = useState("");
  const [entityType, setEntityType] = useState("");
  const [page, setPage] = useState(1);
  const [inputSearch, setInputSearch] = useState("");
  const [inputType, setInputType] = useState("");

  const { data, isLoading } = useQuery<EventsResponse>({
    queryKey: ["admin", "events", search, entityType, page],
    queryFn: () =>
      api.get(
        `/admin/events?search=${encodeURIComponent(search)}&entityType=${encodeURIComponent(entityType)}&page=${page}`
      ),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(inputSearch);
    setEntityType(inputType);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Event log</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={inputSearch}
          onChange={(e) => setInputSearch(e.target.value)}
          placeholder="Search by event type or entity ID…"
          className="flex-1 rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-sm text-white placeholder:text-ink-500 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition"
        />
        <select
          value={inputType}
          onChange={(e) => setInputType(e.target.value)}
          className="rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-brand-400 transition"
        >
          {ENTITY_TYPES.map((t) => (
            <option key={t} value={t}>{t || "All types"}</option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-xl bg-brand-400 text-ink-950 font-bold px-5 py-2.5 text-sm hover:bg-brand-300 transition"
        >
          Search
        </button>
      </form>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="text-ink-400 text-sm p-6">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700/60 text-ink-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Event</th>
                <th className="text-left px-5 py-3 font-semibold">Entity</th>
                <th className="text-left px-5 py-3 font-semibold">Entity ID</th>
                <th className="text-left px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {data?.events.map((e) => (
                <tr key={e.id} className="border-b border-ink-800/40 hover:bg-ink-800/30 transition last:border-0">
                  <td className="px-5 py-2.5 text-white font-medium">{e.eventType}</td>
                  <td className="px-5 py-2.5 text-ink-400">{e.entityType}</td>
                  <td className="px-5 py-2.5 text-ink-500 font-mono text-xs">{e.entityId}</td>
                  <td className="px-5 py-2.5 text-ink-400 text-xs whitespace-nowrap">{fmtDate(e.createdAt)}</td>
                </tr>
              ))}
              {data?.events.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-500">No events found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-400">
          <span>{data.total} events total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-700 hover:bg-ink-700 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-3 py-1.5">Page {page} of {data.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-700 hover:bg-ink-700 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

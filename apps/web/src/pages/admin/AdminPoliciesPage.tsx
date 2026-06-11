import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Card } from "../../components/ui";

interface PolicyRow {
  id: string;
  policyNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  issuedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  quote: { totalPence: number; vehicle: { registration: string; make: string | null; model: string | null } };
  _count: { documents: number };
}

interface PoliciesResponse {
  policies: PolicyRow[];
  total: number;
  page: number;
  pages: number;
}

function money(pence: number) { return `£${(pence / 100).toFixed(2)}`; }
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { timeZone: "Europe/London" });
}

function statusTone(s: string): "success" | "warning" | "neutral" {
  if (s === "ISSUED") return "success";
  if (s === "PENDING") return "warning";
  return "neutral";
}

export function AdminPoliciesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [input, setInput] = useState("");

  const { data, isLoading } = useQuery<PoliciesResponse>({
    queryKey: ["admin", "policies", search, page],
    queryFn: () => api.get(`/admin/policies?search=${encodeURIComponent(search)}&page=${page}`),
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(input);
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-ink">Policies</h1>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by policy number, email, or registration…"
          className="flex-1 rounded-xl bg-white border border-ink/15 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:ring-2 focus:ring-mint focus:border-mint transition"
        />
        <button
          type="submit"
          className="rounded-xl bg-mint text-ink font-bold px-5 py-2.5 text-sm hover:bg-mint-600 transition"
        >
          Search
        </button>
      </form>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <p className="text-ink/55 text-sm p-6">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/8 text-ink/45 text-xs uppercase tracking-wider bg-ink/[.02]">
                <th className="text-left px-5 py-3 font-semibold">Policy</th>
                <th className="text-left px-5 py-3 font-semibold">User</th>
                <th className="text-left px-5 py-3 font-semibold">Vehicle</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Amount</th>
                <th className="text-left px-5 py-3 font-semibold">Dates</th>
                <th className="text-left px-5 py-3 font-semibold">Docs</th>
              </tr>
            </thead>
            <tbody>
              {data?.policies.map((p) => (
                <tr key={p.id} className="border-b border-ink/6 hover:bg-ink/[.02] transition last:border-0">
                  <td className="px-5 py-3">
                    <Link to={`/admin/policies/${p.id}`} className="text-ink font-semibold hover:text-mint-700 transition">
                      {p.policyNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3">
                    <Link to={`/admin/users/${p.user.id}`} className="hover:text-mint-700 transition">
                      <p className="text-ink/70">{p.user.firstName} {p.user.lastName}</p>
                      <p className="text-ink/45 text-xs">{p.user.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink/70">
                    <p className="font-medium">{p.quote.vehicle.registration}</p>
                    <p className="text-xs text-ink/45">{p.quote.vehicle.make} {p.quote.vehicle.model}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-ink font-semibold">{money(p.quote.totalPence)}</td>
                  <td className="px-5 py-3 text-ink/45 text-xs">
                    <p>{fmtDate(p.startDate)}</p>
                    <p>{fmtDate(p.endDate)}</p>
                  </td>
                  <td className="px-5 py-3 text-ink/45 text-xs">{p._count.documents}</td>
                </tr>
              ))}
              {data?.policies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-ink/40">No policies found</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink/50">
          <span>{data.total} policies total</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg bg-white border border-ink/15 hover:bg-ink/5 disabled:opacity-40 transition text-ink"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-ink">Page {page} of {data.pages}</span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page === data.pages}
              className="px-3 py-1.5 rounded-lg bg-white border border-ink/15 hover:bg-ink/5 disabled:opacity-40 transition text-ink"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

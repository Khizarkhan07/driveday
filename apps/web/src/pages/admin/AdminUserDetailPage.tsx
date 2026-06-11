import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Badge, Card } from "../../components/ui";

interface Policy {
  id: string;
  policyNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  issuedAt: string | null;
  quote: { totalPence: number; vehicle: { registration: string; make: string | null; model: string | null } };
  documents: { id: string; type: string }[];
}

interface Event {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  payload: unknown;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  createdAt: string;
  policies: Policy[];
}

function money(pence: number) { return `£${(pence / 100).toFixed(2)}`; }
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" });
}

function statusTone(s: string): "success" | "warning" | "neutral" {
  if (s === "ISSUED") return "success";
  if (s === "PENDING") return "warning";
  return "neutral";
}

export function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<{ user: UserDetail; events: Event[] }>({
    queryKey: ["admin", "users", id],
    queryFn: () => api.get(`/admin/users/${id}`),
  });

  if (isLoading) return <p className="text-ink-400 text-sm">Loading…</p>;
  if (!data) return <p className="text-red-400 text-sm">User not found</p>;

  const { user, events } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin/users" className="text-ink-400 hover:text-white text-sm transition">← Users</Link>
      </div>

      <Card>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-ink-400 text-sm mt-0.5">{user.email}</p>
            <p className="text-ink-500 text-xs mt-1">ID: {user.id}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge tone={user.role === "ADMIN" ? "warning" : "neutral"}>{user.role}</Badge>
            <span className="text-xs text-ink-500">Joined {fmtDate(user.createdAt)}</span>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-base font-bold text-white mb-3">Policies ({user.policies.length})</h2>
        {user.policies.length === 0 ? (
          <Card><p className="text-ink-400 text-sm text-center py-4">No policies</p></Card>
        ) : (
          <div className="space-y-3">
            {user.policies.map((p) => (
              <Card key={p.id} className="p-4 sm:p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Link to={`/admin/policies/${p.id}`} className="text-white font-semibold hover:text-brand-400 transition">
                        {p.policyNumber}
                      </Link>
                      <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                    </div>
                    <p className="text-ink-400 text-xs mt-1">
                      {p.quote.vehicle.registration} · {p.quote.vehicle.make} {p.quote.vehicle.model}
                    </p>
                    <p className="text-ink-500 text-xs mt-0.5">
                      {fmtDate(p.startDate)} → {fmtDate(p.endDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-white font-bold">{money(p.quote.totalPence)}</p>
                    <p className="text-ink-500 text-xs mt-1">{p.documents.length} docs</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base font-bold text-white mb-3">Event log ({events.length})</h2>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700/60 text-ink-400 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3 font-semibold">Event</th>
                <th className="text-left px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-ink-800/40 last:border-0">
                  <td className="px-5 py-2.5 text-white font-medium">{e.eventType}</td>
                  <td className="px-5 py-2.5 text-ink-400 text-xs">{fmtDate(e.createdAt)}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-6 text-center text-ink-500">No events</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

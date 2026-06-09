import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { PolicySummary } from "@motorcover/shared-types";
import { api } from "../lib/api";
import { useCurrentUser } from "../lib/auth";
import { Badge, Button, Card } from "../components/ui";

function money(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

function statusTone(status: string): "success" | "warning" | "neutral" {
  if (status === "ISSUED") return "success";
  if (status === "PENDING") return "warning";
  return "neutral";
}

export function PortalPage() {
  const { data: userData, isLoading: userLoading } = useCurrentUser();
  const policies = useQuery<{ policies: PolicySummary[] }>({
    queryKey: ["portal", "policies"],
    queryFn: () => api.get("/portal/policies"),
    enabled: Boolean(userData?.user),
  });

  if (!userLoading && !userData?.user) return <Navigate to="/login?next=/portal" replace />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">My policies</h1>
          <p className="text-sm text-ink-400 mt-0.5">Your active and past Day Drive policies</p>
        </div>
        <Link to="/">
          <Button variant="secondary">+ New quote</Button>
        </Link>
      </div>

      {policies.isLoading && (
        <Card>
          <div className="flex items-center gap-3 text-ink-400">
            <svg className="animate-spin w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Loading policies…</span>
          </div>
        </Card>
      )}

      {policies.data && policies.data.policies.length === 0 && (
        <Card className="text-center py-12 space-y-4">
          <div className="text-4xl">🚗</div>
          <div>
            <p className="text-white font-semibold">No policies yet</p>
            <p className="text-sm text-ink-400 mt-1">Get your first quote in under 2 minutes</p>
          </div>
          <Link to="/">
            <Button>Get a quote →</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-3">
        {policies.data?.policies.map((p) => (
          <Link key={p.id} to={`/portal/policies/${p.id}`}>
            <Card className="hover:border-brand-400/50 hover:bg-ink-800/80 transition-all duration-150 cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-ink-800 border border-ink-700 flex items-center justify-center text-lg group-hover:border-brand-400/30 transition">
                    🚗
                  </div>
                  <div>
                    <p className="font-semibold text-white">{p.policyNumber}</p>
                    <p className="text-sm text-ink-400">
                      {p.vehicleRegistration} ·{" "}
                      {new Date(p.startDate).toLocaleDateString("en-GB")} –{" "}
                      {new Date(p.endDate).toLocaleDateString("en-GB")}
                    </p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold text-white">{money(p.totalPence)}</p>
                  <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { Card } from "../../components/ui";

interface Stats {
  totalUsers: number;
  totalPolicies: number;
  totalRevenuePence: number;
  recentEvents: { id: string; entityType: string; entityId: string; eventType: string; createdAt: string }[];
}

function money(pence: number) {
  return `£${(pence / 100).toFixed(2)}`;
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" });
}

export function AdminDashboardPage() {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ["admin", "stats"],
    queryFn: () => api.get("/admin/stats"),
  });

  if (isLoading) return <p className="text-ink/55 text-sm">Loading…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-display font-bold text-ink">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <p className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-1">Total users</p>
          <p className="text-3xl font-display font-bold text-ink">{data?.totalUsers ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-1">Total policies</p>
          <p className="text-3xl font-display font-bold text-ink">{data?.totalPolicies ?? 0}</p>
        </Card>
        <Card>
          <p className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-1">Total revenue</p>
          <p className="text-3xl font-display font-bold text-mint-700">{money(data?.totalRevenuePence ?? 0)}</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-ink mb-4">Recent activity</h2>
        <div className="space-y-0">
          {data?.recentEvents.map((e) => (
            <div key={e.id} className="flex items-center justify-between text-sm py-2.5 border-b border-ink/6 last:border-0">
              <div>
                <span className="text-ink font-medium">{e.eventType}</span>
                <span className="text-ink/45 ml-2">{e.entityType} · {e.entityId.slice(0, 12)}…</span>
              </div>
              <span className="text-ink/40 text-xs shrink-0 ml-4">{fmtDate(e.createdAt)}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

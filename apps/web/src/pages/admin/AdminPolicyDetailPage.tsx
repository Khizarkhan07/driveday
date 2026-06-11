import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api, apiBaseUrl, sessionToken } from "../../lib/api";
import { Badge, Card } from "../../components/ui";

async function downloadDocument(docId: string, filename: string) {
  const token = sessionToken.get();
  const res = await fetch(`${apiBaseUrl}/portal/documents/${docId}/download`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error("Download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface PolicyDetail {
  id: string;
  policyNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  issuedAt: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
  quote: {
    totalPence: number;
    durationDays: number;
    driverDetails: Record<string, unknown>;
    vehicle: { registration: string; make: string | null; model: string | null; colour: string | null; yearOfManufacture: number | null };
  };
  payment: { id: string; stripePaymentIntentId: string; amountPence: number; status: string } | null;
  documents: { id: string; type: string; storageKey: string }[];
}

interface Event {
  id: string;
  eventType: string;
  payload: unknown;
  createdAt: string;
}

function money(pence: number) { return `£${(pence / 100).toFixed(2)}`; }
function fmtDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London" });
}
function statusTone(s: string): "success" | "warning" | "neutral" {
  if (s === "ISSUED" || s === "SUCCEEDED") return "success";
  if (s === "PENDING" || s === "PROCESSING") return "warning";
  return "neutral";
}

const DOC_LABELS: Record<string, string> = {
  CERTIFICATE: "Certificate",
  POLICY_SCHEDULE: "Policy Schedule",
  IPID: "IPID",
  POLICY_WORDING: "Policy Wording",
  TERMS_OF_BUSINESS: "Terms of Business",
};

export function AdminPolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useQuery<{ policy: PolicyDetail; events: Event[] }>({
    queryKey: ["admin", "policies", id],
    queryFn: () => api.get(`/admin/policies/${id}`),
  });

  if (isLoading) return <p className="text-ink/55 text-sm">Loading…</p>;
  if (!data) return <p className="text-red-500 text-sm">Policy not found</p>;

  const { policy, events } = data;

  return (
    <div className="space-y-6">
      <Link to="/admin/policies" className="text-ink/55 hover:text-ink text-sm transition">← Policies</Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-display font-bold text-ink">{policy.policyNumber}</h1>
          <p className="text-ink/55 text-sm mt-0.5">Issued {fmtDate(policy.issuedAt)}</p>
        </div>
        <Badge tone={statusTone(policy.status)}>{policy.status}</Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <h2 className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-3">Policyholder</h2>
          <Link to={`/admin/users/${policy.user.id}`} className="hover:text-mint-700 transition">
            <p className="text-ink font-semibold">{policy.user.firstName} {policy.user.lastName}</p>
            <p className="text-ink/55 text-sm">{policy.user.email}</p>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-3">Vehicle</h2>
          <p className="text-ink font-semibold">{policy.quote.vehicle.registration}</p>
          <p className="text-ink/55 text-sm">
            {policy.quote.vehicle.make} {policy.quote.vehicle.model}
            {policy.quote.vehicle.colour ? ` · ${policy.quote.vehicle.colour}` : ""}
            {policy.quote.vehicle.yearOfManufacture ? ` · ${policy.quote.vehicle.yearOfManufacture}` : ""}
          </p>
        </Card>

        <Card>
          <h2 className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-3">Cover period</h2>
          <p className="text-ink">{fmtDate(policy.startDate)}</p>
          <p className="text-ink/55 text-sm">to {fmtDate(policy.endDate)}</p>
          <p className="text-ink/40 text-xs mt-1">{policy.quote.durationDays} day{policy.quote.durationDays !== 1 ? "s" : ""}</p>
        </Card>

        <Card>
          <h2 className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-3">Payment</h2>
          <p className="text-2xl font-display font-bold text-mint-700">{money(policy.quote.totalPence)}</p>
          {policy.payment && (
            <>
              <Badge tone={statusTone(policy.payment.status)}>{policy.payment.status}</Badge>
              <p className="text-ink/35 text-xs mt-2 break-all">{policy.payment.stripePaymentIntentId}</p>
            </>
          )}
        </Card>
      </div>

      <Card>
        <h2 className="text-xs text-ink/45 uppercase tracking-wider font-semibold mb-3">Documents</h2>
        {policy.documents.length === 0 ? (
          <p className="text-ink/40 text-sm">No documents</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {policy.documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => downloadDocument(doc.id, `${doc.type.toLowerCase()}.pdf`)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-ink/15 px-3 py-2 text-sm text-ink hover:bg-mint/5 hover:border-mint/40 transition"
              >
                <svg className="w-4 h-4 text-ink/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                {DOC_LABELS[doc.type] ?? doc.type}
              </button>
            ))}
          </div>
        )}
      </Card>

      <div>
        <h2 className="text-base font-semibold text-ink mb-3">Event log</h2>
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/8 text-ink/45 text-xs uppercase tracking-wider bg-ink/[.02]">
                <th className="text-left px-5 py-3 font-semibold">Event</th>
                <th className="text-left px-5 py-3 font-semibold">When</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id} className="border-b border-ink/6 last:border-0">
                  <td className="px-5 py-2.5 text-ink font-medium">{e.eventType}</td>
                  <td className="px-5 py-2.5 text-ink/45 text-xs">{fmtDate(e.createdAt)}</td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr><td colSpan={2} className="px-5 py-6 text-center text-ink/40">No events</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

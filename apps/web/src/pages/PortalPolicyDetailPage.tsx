import { Link, Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { type DocumentSummary, type DocumentType } from "@motorcover/shared-types";
import { api, apiBaseUrl, sessionToken } from "../lib/api";
import { useCurrentUser } from "../lib/auth";

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
import { Badge, Card } from "../components/ui";

interface PolicyDetailResponse {
  policy: {
    id: string;
    policyNumber: string;
    status: string;
    startDate: string;
    endDate: string;
    issuedAt: string | null;
    vehicle: { registration: string; make: string | null; model: string | null };
    totalPence: number;
    documents: DocumentSummary[];
  };
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  CERTIFICATE: "Certificate of Motor Insurance",
  POLICY_SCHEDULE: "Policy Schedule",
  IPID: "Statement of Fact",
  POLICY_WORDING: "Policy Wording",
  TERMS_OF_BUSINESS: "Terms of Business",
};

const DOCUMENT_ICONS: Record<DocumentType, string> = {
  CERTIFICATE: "🏅",
  POLICY_SCHEDULE: "📋",
  IPID: "📄",
  POLICY_WORDING: "📖",
  TERMS_OF_BUSINESS: "📝",
};

function money(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`;
}

export function PortalPolicyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: userData, isLoading: userLoading } = useCurrentUser();

  const detail = useQuery<PolicyDetailResponse>({
    queryKey: ["portal", "policy", id],
    queryFn: () => api.get(`/portal/policies/${id}`),
    enabled: Boolean(userData?.user && id),
  });

  if (!userLoading && !userData?.user) {
    return <Navigate to={`/login?next=/portal/policies/${id}`} replace />;
  }

  const policy = detail.data?.policy;

  return (
    <div className="space-y-6">
      <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-white transition">
        ← Back to my policies
      </Link>

      {detail.isLoading && (
        <Card>
          <div className="flex items-center gap-3 text-ink-400">
            <svg className="animate-spin w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span className="text-sm">Loading policy…</span>
          </div>
        </Card>
      )}

      {policy && (
        <div className="space-y-4">
          {/* Header card */}
          <Card className="relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-brand-400/8 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-ink-800 border border-ink-700 flex items-center justify-center text-2xl">
                  🚗
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Policy number</p>
                  <p className="text-xl font-extrabold text-white">{policy.policyNumber}</p>
                  <p className="text-sm text-ink-400">
                    {policy.vehicle.registration} · {[policy.vehicle.make, policy.vehicle.model].filter(Boolean).join(" ")}
                  </p>
                </div>
              </div>
              <Badge tone={policy.status === "ISSUED" ? "success" : "warning"}>{policy.status}</Badge>
            </div>
          </Card>

          {/* Details */}
          <Card>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">Policy details</p>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink-500 mb-1">Cover starts</dt>
                <dd className="text-white font-medium">
                  {new Date(policy.startDate).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500 mb-1">Cover ends</dt>
                <dd className="text-white font-medium">
                  {new Date(policy.endDate).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500 mb-1">Premium paid</dt>
                <dd className="text-white font-bold text-base">{money(policy.totalPence)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-500 mb-1">Issued</dt>
                <dd className="text-white font-medium">
                  {policy.issuedAt
                    ? new Date(policy.issuedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })
                    : "Pending"}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Documents */}
          <Card>
            <p className="text-xs font-semibold text-ink-500 uppercase tracking-wider mb-4">Policy documents</p>
            {policy.documents.length === 0 ? (
              <div className="flex items-center gap-3 py-2">
                <svg className="animate-spin w-4 h-4 text-brand-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm text-ink-400">Generating documents — refresh in a moment</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {policy.documents.map((doc) => (
                  <li key={doc.id}>
                    <button
                      onClick={() => downloadDocument(doc.id, `${doc.type.toLowerCase()}.pdf`)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-ink-800/60 border border-ink-700/50 hover:border-brand-400/40 hover:bg-ink-800 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{DOCUMENT_ICONS[doc.type]}</span>
                        <span className="text-sm text-white font-medium">{DOCUMENT_LABELS[doc.type]}</span>
                      </div>
                      <span className="text-xs font-semibold text-brand-400 group-hover:text-brand-300 transition">
                        Download PDF →
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

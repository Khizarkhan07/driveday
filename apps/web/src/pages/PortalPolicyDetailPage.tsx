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
import { useState } from "react";
import { Badge, Button, Card } from "../components/ui";

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
  const [resending, setResending] = useState(false);
  const [resendDone, setResendDone] = useState(false);

  async function handleResendEmail() {
    setResending(true);
    setResendDone(false);
    try {
      await api.post(`/portal/policies/${id}/resend-email`, {});
      setResendDone(true);
    } finally {
      setResending(false);
    }
  }

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
      <Link to="/portal" className="inline-flex items-center gap-1.5 text-sm text-ink/55 hover:text-ink transition">
        ← Back to my policies
      </Link>

      {detail.isLoading && (
        <Card>
          <div className="flex items-center gap-3 text-ink/55">
            <svg className="animate-spin w-5 h-5 text-mint" fill="none" viewBox="0 0 24 24">
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
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-mint/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-mint/10 border border-mint/20 flex items-center justify-center text-2xl">
                  🚗
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Policy number</p>
                  <p className="text-xl font-display font-bold text-ink">{policy.policyNumber}</p>
                  <p className="text-sm text-ink/55">
                    {policy.vehicle.registration} · {[policy.vehicle.make, policy.vehicle.model].filter(Boolean).join(" ")}
                  </p>
                </div>
              </div>
              <Badge tone={policy.status === "ISSUED" ? "success" : "warning"}>{policy.status}</Badge>
            </div>
          </Card>

          {/* Details */}
          <Card>
            <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mb-4">Policy details</p>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-xs text-ink/45 mb-1">Cover starts</dt>
                <dd className="text-ink font-medium">
                  {new Date(policy.startDate).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink/45 mb-1">Cover ends</dt>
                <dd className="text-ink font-medium">
                  {new Date(policy.endDate).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink/45 mb-1">Premium paid</dt>
                <dd className="text-ink font-bold text-base">{money(policy.totalPence)}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink/45 mb-1">Issued</dt>
                <dd className="text-ink font-medium">
                  {policy.issuedAt
                    ? new Date(policy.issuedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })
                    : "Pending"}
                </dd>
              </div>
            </dl>
          </Card>

          {/* Documents */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Policy documents</p>
              <Button
                variant="secondary"
                onClick={handleResendEmail}
                disabled={resending}
              >
                {resending ? "Sending…" : resendDone ? "Sent!" : "Email documents"}
              </Button>
            </div>
            {policy.documents.length === 0 ? (
              <div className="flex items-center gap-3 py-2">
                <svg className="animate-spin w-4 h-4 text-mint" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm text-ink/55">Generating documents — refresh in a moment</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {policy.documents.map((doc) => (
                  <li key={doc.id}>
                    <button
                      onClick={() => downloadDocument(doc.id, `${doc.type.toLowerCase()}.pdf`)}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-ink/[.03] border border-ink/8 hover:border-mint/40 hover:bg-mint/5 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{DOCUMENT_ICONS[doc.type]}</span>
                        <span className="text-sm text-ink font-medium">{DOCUMENT_LABELS[doc.type]}</span>
                      </div>
                      <span className="text-xs font-semibold text-mint-700 group-hover:text-mint-600 transition">
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

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { Banner, Button, Card, Field, Stepper } from "../components/ui";

function defaultStart(): string {
  const d = new Date(Date.now() + 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return toLocalInputValue(d);
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function addHours(d: Date, h: number): Date {
  return new Date(d.getTime() + h * 60 * 60 * 1000);
}

export function CoverDetailsPage() {
  const navigate = useNavigate();
  const vehicle = useBuyFlowStore((s) => s.vehicle);
  const setCoverDetails = useBuyFlowStore((s) => s.setCoverDetails);
  const storedStart = useBuyFlowStore((s) => s.startDate);

  const [start, setStart] = useState(
    storedStart ? toLocalInputValue(new Date(storedStart)) : defaultStart()
  );
  const [error, setError] = useState<string | null>(null);

  if (!vehicle) return <Navigate to="/" replace />;

  const previewEnd = (() => {
    const d = new Date(start);
    if (isNaN(d.getTime())) return null;
    return addHours(d, 24);
  })();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const startDate = new Date(start);
    if (Number.isNaN(startDate.getTime())) {
      setError("Enter a valid start time");
      return;
    }
    if (startDate < new Date(Date.now() - 60_000)) {
      setError("Cover start must be in the future");
      return;
    }
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
    setError(null);
    setCoverDetails(startDate.toISOString(), endDate.toISOString());
    navigate("/driver-details");
  }

  return (
    <div className="space-y-6">
      <Stepper step={2} total={5} />

      <div>
        <h1 className="text-2xl font-display font-bold text-ink">When do you need cover?</h1>
        <p className="text-sm text-ink/55 mt-1">
          1-day policy for <span className="text-ink font-semibold">{vehicle.registration}</span>
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field
            label="Cover start"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />

          {previewEnd && (
            <div className="rounded-xl bg-ink/[.04] border border-ink/8 p-4 space-y-2">
              <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Cover summary</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-ink/45 text-xs">Starts</p>
                  <p className="text-ink font-medium">
                    {new Date(start).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })}
                  </p>
                </div>
                <div>
                  <p className="text-ink/45 text-xs">Ends (24 hrs)</p>
                  <p className="text-ink font-medium">
                    {previewEnd.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/London" })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <span className="w-2 h-2 rounded-full bg-mint" />
                <p className="text-xs text-mint-700 font-semibold">1 day · 24 hours continuous cover</p>
              </div>
            </div>
          )}

          {error && <Banner tone="danger">{error}</Banner>}

          <Button type="submit" className="w-full">Continue →</Button>
        </form>
      </Card>
    </div>
  );
}

import { Navigate, useNavigate } from "react-router-dom";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { Button, Card, Stepper } from "../components/ui";

export function VehicleConfirmPage() {
  const navigate = useNavigate();
  const vehicle = useBuyFlowStore((s) => s.vehicle);

  if (!vehicle) return <Navigate to="/" replace />;

  return (
    <div className="space-y-6">
      <Stepper step={1} total={5} />

      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Is this your vehicle?</h1>
        <p className="text-sm text-ink/55 mt-1">Confirm the details before we proceed</p>
      </div>

      <Card>
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-ink/8">
          <div className="w-10 h-10 rounded-xl bg-mint/15 border border-mint/25 flex items-center justify-center text-lg">
            🚗
          </div>
          <div>
            <p className="font-display font-bold text-xl text-ink tracking-widest">{vehicle.registration}</p>
            <p className="text-sm text-ink/55">
              {[vehicle.colour, vehicle.yearOfManufacture, vehicle.make, vehicle.model].filter(Boolean).join(" ")}
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-y-4 text-sm">
          <dt className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Make & model</dt>
          <dd className="text-ink font-medium">{[vehicle.make, vehicle.model].filter(Boolean).join(" ") || "—"}</dd>

          <dt className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Colour</dt>
          <dd className="text-ink font-medium">{vehicle.colour ?? "—"}</dd>

          <dt className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Year</dt>
          <dd className="text-ink font-medium">{vehicle.yearOfManufacture ?? "—"}</dd>

          <dt className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Fuel type</dt>
          <dd className="text-ink font-medium">{vehicle.fuelType ?? "—"}</dd>
        </dl>

        <div className="mt-8 flex gap-3">
          <Button onClick={() => navigate("/cover-details")}>
            Yes, that's my vehicle →
          </Button>
          <Button variant="secondary" onClick={() => navigate("/")}>
            Search again
          </Button>
        </div>
      </Card>
    </div>
  );
}

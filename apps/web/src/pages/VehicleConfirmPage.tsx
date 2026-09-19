import { Navigate, useNavigate } from "react-router-dom";
import { VEHICLE_TYPE_LABELS } from "@motorcover/shared-types";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { Banner, Button, Card, Stepper } from "../components/ui";

const VEHICLE_TYPE_ICONS: Record<string, string> = {
  car: "🚗",
  van: "🚐",
  motorcycle: "🏍️",
  hgv: "🚚",
  other: "🚗",
};

export function VehicleConfirmPage() {
  const navigate = useNavigate();
  const vehicle = useBuyFlowStore((s) => s.vehicle);

  if (!vehicle) return <Navigate to="/" replace />;

  // The Irish register returns no vehicle category, so every lookup would
  // otherwise default to "Car" and state something we do not actually know.
  const typeIsKnown = vehicle.source !== "regcheck";

  // A manual entry was never checked against a register, so the usual "is this
  // your vehicle?" reassurance doesn't apply — these are the customer's own
  // words being read back to them.
  const isSelfDeclared = vehicle.source === "manual";

  const editHref = `/vehicle-manual?reg=${encodeURIComponent(vehicle.registration)}`;

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
            {typeIsKnown ? VEHICLE_TYPE_ICONS[vehicle.vehicleType] ?? "🚗" : "🚗"}
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

          <dt className="text-xs font-semibold text-ink/45 uppercase tracking-wider">Vehicle type</dt>
          <dd className="text-ink font-medium">
            {typeIsKnown ? VEHICLE_TYPE_LABELS[vehicle.vehicleType] ?? "—" : "—"}
          </dd>
        </dl>

        {isSelfDeclared ? (
          <div className="mt-6">
            <Banner tone="warning">
              You entered these details yourself — we couldn't find this
              registration on the vehicle register. Check them carefully, as
              they'll appear on your Certificate of Insurance.
            </Banner>
          </div>
        ) : null}

        <div className="mt-8 flex gap-3">
          <Button onClick={() => navigate("/cover-details")}>
            Yes, that's my vehicle →
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              navigate(isSelfDeclared ? editHref : "/")
            }
          >
            {isSelfDeclared ? "Edit details" : "Search again"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

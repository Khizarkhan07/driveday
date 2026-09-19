import { useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import {
  FUEL_TYPES,
  VEHICLE_TYPE_LABELS,
  manualVehicleEntrySchema,
  registrationSchemaFor,
  ukRegistrationSchema,
  type LookupCountry,
  type VehicleLookupResult,
  type VehicleType,
} from "@motorcover/shared-types";
import { api, ApiError } from "../lib/api";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { Banner, Button, Card, Field, Select, Stepper } from "../components/ui";

const VEHICLE_TYPES = Object.keys(VEHICLE_TYPE_LABELS) as VehicleType[];

const EMPTY_FORM = {
  make: "",
  model: "",
  colour: "",
  yearOfManufacture: "",
  fuelType: "",
  vehicleType: "",
};

/**
 * Which register the plate was searched against. Normally it's in the URL,
 * put there by the landing page. Coming back here to edit an entry it isn't,
 * so fall back to the format the plate matches — and prefer UK where both fit
 * (an 8-character Irish plate is also a valid UK one), since the only thing
 * that turns on it is which format the reg is validated against, and the reg
 * is fixed by then.
 */
function resolveCountry(param: string | null, registration: string): LookupCountry {
  if (param === "ie" || param === "uk") return param;
  return ukRegistrationSchema.safeParse(registration).success ? "uk" : "ie";
}

/**
 * Reached only when a lookup came back VEHICLE_NOT_FOUND — typically a car too
 * new to have reached the register yet. The registration travels in the query
 * string rather than component state so a refresh mid-form doesn't strand the
 * customer back at the landing page.
 */
export function ManualVehiclePage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const setVehicle = useBuyFlowStore((s) => s.setVehicle);

  const registration = params.get("reg") ?? "";
  const country = resolveCountry(params.get("country"), registration);

  // Returning here from the confirm page to correct something should show what
  // was entered, not an empty form.
  const existing = useBuyFlowStore((s) => s.vehicle);
  const [form, setForm] = useState(() =>
    existing?.source === "manual" && existing.registration === registration
      ? {
          make: existing.make ?? "",
          model: existing.model ?? "",
          colour: existing.colour ?? "",
          yearOfManufacture: existing.yearOfManufacture?.toString() ?? "",
          fuelType: existing.fuelType ?? "",
          vehicleType: existing.vehicleType ?? "",
        }
      : EMPTY_FORM
  );
  const [declared, setDeclared] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = useMutation({
    mutationFn: (body: unknown) =>
      api.post<{ vehicle: VehicleLookupResult & { id: string } }>(
        "/vehicle-lookup/manual",
        body
      ),
    onSuccess: ({ vehicle }) => {
      setVehicle(vehicle);
      navigate("/vehicle-confirm");
    },
  });

  // Without a registration there is nothing to describe — that only happens if
  // someone opens this URL directly, so send them back to the search.
  if (!registrationSchemaFor(country).safeParse(registration).success) {
    return <Navigate to="/" replace />;
  }

  function update(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors(({ [field]: _cleared, ...rest }) => rest);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const parsed = manualVehicleEntrySchema.safeParse({
      registration,
      country,
      ...form,
      // An empty year must reach the schema as something it rejects rather
      // than as NaN, which reports as a confusing "expected number" error.
      yearOfManufacture: form.yearOfManufacture ? Number(form.yearOfManufacture) : undefined,
      detailsDeclared: declared,
    });

    if (!parsed.success) {
      setErrors(
        Object.fromEntries(
          parsed.error.issues.map((issue) => [
            issue.path.join("."),
            issue.message,
          ])
        )
      );
      return;
    }

    setErrors({});
    submit.mutate(parsed.data);
  }

  return (
    <div className="space-y-6">
      <Stepper step={1} total={5} />

      <div>
        <h1 className="text-2xl font-display font-bold text-ink">
          Tell us about your vehicle
        </h1>
        <p className="text-sm text-ink/55 mt-1">
          We couldn't find {registration} on the vehicle register — brand new
          cars often take a few weeks to appear. Fill in the details and we'll
          carry on.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <span className="block text-xs font-semibold text-ink/50 uppercase tracking-wider mb-1.5">
              Registration
            </span>
            <p className="font-display font-bold text-xl text-ink tracking-widest">
              {registration}
            </p>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-xs font-semibold text-mint-700 hover:underline mt-1"
            >
              Not right? Search again
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field
              label="Make"
              placeholder="e.g. Tesla"
              value={form.make}
              onChange={(e) => update("make", e.target.value)}
              error={errors.make}
            />
            <Field
              label="Model"
              placeholder="e.g. Model 3"
              value={form.model}
              onChange={(e) => update("model", e.target.value)}
              error={errors.model}
            />
            <Field
              label="Colour"
              placeholder="e.g. White"
              value={form.colour}
              onChange={(e) => update("colour", e.target.value)}
              error={errors.colour}
            />
            <Field
              label="Year of manufacture"
              type="number"
              inputMode="numeric"
              placeholder={String(new Date().getFullYear())}
              min={1900}
              max={new Date().getFullYear() + 1}
              value={form.yearOfManufacture}
              onChange={(e) => update("yearOfManufacture", e.target.value)}
              error={errors.yearOfManufacture}
            />
            <Select
              label="Fuel type"
              value={form.fuelType}
              onChange={(e) => update("fuelType", e.target.value)}
              error={errors.fuelType}
            >
              <option value="">Select…</option>
              {FUEL_TYPES.map((fuel) => (
                <option key={fuel} value={fuel}>
                  {fuel}
                </option>
              ))}
            </Select>
            <Select
              label="Vehicle type"
              value={form.vehicleType}
              onChange={(e) => update("vehicleType", e.target.value)}
              error={errors.vehicleType}
            >
              <option value="">Select…</option>
              {VEHICLE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {VEHICLE_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => {
                  setDeclared(e.target.checked);
                  setErrors(({ detailsDeclared: _cleared, ...rest }) => rest);
                }}
                className="w-4 h-4 mt-0.5 rounded border-ink/25 text-mint focus:ring-mint accent-mint cursor-pointer shrink-0"
              />
              <span className="text-sm text-ink/70">
                I confirm these details are accurate. They'll appear on my
                Certificate of Insurance, and incorrect details can invalidate
                the policy.
              </span>
            </label>
            {errors.detailsDeclared ? (
              <p className="text-xs text-red-500 mt-1.5">
                Please confirm the details are accurate
              </p>
            ) : null}
          </div>

          {submit.isError ? (
            <Banner tone="danger">
              {submit.error instanceof ApiError
                ? submit.error.message
                : "Something went wrong saving those details."}
            </Banner>
          ) : null}

          <Button type="submit" disabled={submit.isPending}>
            {submit.isPending ? "Saving…" : "Continue →"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

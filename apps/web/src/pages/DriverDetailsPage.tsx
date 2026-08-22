import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { driverDetailsSchema, type DriverDetails } from "@motorcover/shared-types";
import { useBuyFlowStore } from "../lib/buy-flow-store";
import { Button, Card, Field, Stepper, Banner } from "../components/ui";

export function DriverDetailsPage() {
  const navigate = useNavigate();
  const vehicle = useBuyFlowStore((s) => s.vehicle);
  const startDate = useBuyFlowStore((s) => s.startDate);
  const storedDriver = useBuyFlowStore((s) => s.driver);
  const setDriver = useBuyFlowStore((s) => s.setDriver);

  // Only pre-tick when returning to a form they already submitted without a
  // licence number; a first visit should ask for it normally.
  const [withholdLicence, setWithholdLicence] = useState(
    storedDriver ? !storedDriver.licenceNumber : false
  );

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<DriverDetails>({
    resolver: zodResolver(driverDetailsSchema),
    defaultValues: storedDriver ?? {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      postcode: "",
      licenceNumber: "",
      yearsHeldLicence: 0,
      hasConvictions: false,
      hasClaims: false,
    },
  });

  if (!vehicle || !startDate) return <Navigate to="/" replace />;

  function onSubmit(values: DriverDetails) {
    setDriver(values);
    navigate("/quote");
  }

  return (
    <div className="space-y-6">
      <Stepper step={3} total={5} />

      <div>
        <h1 className="text-2xl font-display font-bold text-ink">Driver details</h1>
        <p className="text-sm text-ink/55 mt-1">Tell us about the person driving the vehicle</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mb-4">Personal information</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First name" {...register("firstName")} error={errors.firstName?.message} />
              <Field label="Last name" {...register("lastName")} error={errors.lastName?.message} />
            </div>
            <Field
              label="Date of birth"
              type="date"
              {...register("dateOfBirth")}
              error={errors.dateOfBirth?.message}
            />
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mb-4">Address</p>
          <div className="space-y-4">
            <Field label="Address line 1" {...register("addressLine1")} error={errors.addressLine1?.message} />
            <Field label="Address line 2 (optional)" {...register("addressLine2")} />
            <div className="grid grid-cols-2 gap-4">
              <Field label="Town / city" {...register("city")} error={errors.city?.message} />
              <Field label="Postcode" {...register("postcode")} error={errors.postcode?.message} />
            </div>
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mb-4">Licence details</p>
          <div className="space-y-4">
            <Field
              label="Driving licence number"
              disabled={withholdLicence}
              placeholder={withholdLicence ? "Not provided" : undefined}
              {...register("licenceNumber")}
              error={withholdLicence ? undefined : errors.licenceNumber?.message}
            />

            <label className="flex items-start gap-2.5 cursor-pointer select-none -mt-1">
              <input
                type="checkbox"
                checked={withholdLicence}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setWithholdLicence(checked);
                  // Clear the field so a half-typed value cannot fail
                  // validation while the field is disabled.
                  if (checked) {
                    setValue("licenceNumber", "");
                    clearErrors("licenceNumber");
                  }
                }}
                className="mt-0.5 w-4 h-4 rounded border-ink/25 accent-mint cursor-pointer shrink-0"
              />
              <span className="text-sm text-ink/70">
                I&apos;d rather not share my licence number
              </span>
            </label>
            <Field
              label="Years held licence"
              type="number"
              min={0}
              max={80}
              {...register("yearsHeldLicence", { valueAsNumber: true })}
              error={errors.yearsHeldLicence?.message}
            />
          </div>
        </Card>

        <Card>
          <p className="text-xs font-semibold text-ink/45 uppercase tracking-wider mb-4">Declarations</p>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register("hasClaims")}
                className="mt-0.5 w-4 h-4 rounded accent-mint border-ink/20"
              />
              <span className="text-sm text-ink/65 group-hover:text-ink transition">
                I've had a motor insurance claim in the last 5 years
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                {...register("hasConvictions")}
                className="mt-0.5 w-4 h-4 rounded accent-mint border-ink/20"
              />
              <span className="text-sm text-ink/65 group-hover:text-ink transition">
                I have unspent motoring convictions
              </span>
            </label>
          </div>
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Saving…" : "Get my quote →"}
        </Button>
      </form>
    </div>
  );
}

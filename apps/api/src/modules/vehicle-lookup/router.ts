import { Router } from "express";
import {
  manualVehicleEntrySchema,
  vehicleLookupRequestSchema,
} from "@motorcover/shared-types";
import { prisma } from "../../db/client";
import { getVehicleLookupProvider } from "../../providers/vehicle-lookup/factory";
import { VehicleNotFoundError } from "../../providers/vehicle-lookup/types";
import { buildManualVehicleRecord } from "./manual-entry";

export const vehicleLookupRouter = Router();

vehicleLookupRouter.post("/", async (req, res) => {
  const parsed = vehicleLookupRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    const country = (req.body as { country?: string })?.country;
    return res.status(400).json({
      error:
        country === "ie"
          ? "Enter a valid Irish registration number, e.g. 161-D-12345"
          : "Enter a valid UK registration number",
    });
  }
  const { registration, country } = parsed.data;

  try {
    const result = await getVehicleLookupProvider(country).lookup(registration);

    const vehicle = await prisma.vehicle.create({
      data: {
        registration: result.registration,
        make: result.make,
        model: result.model,
        colour: result.colour,
        yearOfManufacture: result.yearOfManufacture,
        fuelType: result.fuelType,
        vehicleType: result.vehicleType,
        source: result.source,
        rawLookupJson: result as object,
      },
    });

    return res.status(201).json({ vehicle: { id: vehicle.id, ...result } });
  } catch (err) {
    if (err instanceof VehicleNotFoundError) {
      // The code lets the web app tell "that plate isn't on the register"
      // apart from "the provider is down" — manual entry is only offered for
      // the former, since a provider outage is not the customer's problem to
      // work around by typing the details themselves.
      return res.status(404).json({
        code: "VEHICLE_NOT_FOUND",
        error: "We couldn't find a vehicle for that registration. Double-check it and try again, or enter the details manually.",
      });
    }
    throw err;
  }
});

/**
 * Fallback for registrations no provider can resolve — in practice cars new
 * enough that they haven't reached the registers yet.
 *
 * The details are taken on the customer's declaration and not verified
 * anywhere. That is safe on price (the premium is a flat rate by cover type,
 * so there is nothing to gain by misdescribing the car) but it does decide
 * what gets printed on a Certificate of Insurance, which is why the schema
 * requires every field and an explicit declaration.
 */
vehicleLookupRouter.post("/manual", async (req, res) => {
  const parsed = manualVehicleEntrySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.issues[0]?.message ?? "Check the vehicle details and try again",
      field: parsed.error.issues[0]?.path.join("."),
    });
  }

  const record = buildManualVehicleRecord(parsed.data, new Date());
  const vehicle = await prisma.vehicle.create({ data: record });

  const { rawLookupJson: _raw, ...result } = record;
  return res.status(201).json({ vehicle: { id: vehicle.id, ...result } });
});

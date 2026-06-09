import { Router } from "express";
import { vehicleLookupRequestSchema } from "@motorcover/shared-types";
import { prisma } from "../../db/client";
import { getVehicleLookupProvider } from "../../providers/vehicle-lookup/factory";
import { VehicleNotFoundError } from "../../providers/vehicle-lookup/types";

export const vehicleLookupRouter = Router();

vehicleLookupRouter.post("/", async (req, res) => {
  const parsed = vehicleLookupRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "Enter a valid UK registration number" });
  }
  const { registration } = parsed.data;

  try {
    const result = await getVehicleLookupProvider().lookup(registration);

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
      return res.status(404).json({
        error: "We couldn't find a vehicle for that registration. Double-check it and try again, or enter the details manually.",
      });
    }
    throw err;
  }
});

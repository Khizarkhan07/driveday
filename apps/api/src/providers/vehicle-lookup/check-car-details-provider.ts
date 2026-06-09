import { env } from "../../config/env";
import type { VehicleLookupProvider, VehicleLookupResult } from "./types";
import { VehicleNotFoundError } from "./types";

const BASE_URL = "https://api.checkcardetails.co.uk/vehicledata/vehicleregistration";

export class CheckCarDetailsProvider implements VehicleLookupProvider {
  readonly name = "checkcardetails" as const;

  async lookup(registration: string): Promise<VehicleLookupResult> {
    const url = `${BASE_URL}?apikey=${encodeURIComponent(env.checkCarDetailsApiKey)}&vrm=${encodeURIComponent(registration)}`;

    const response = await fetch(url, { method: "GET" });

    if (response.status === 404) {
      throw new VehicleNotFoundError(registration);
    }
    if (!response.ok) {
      throw new Error(`CheckCarDetails lookup failed: ${response.status} ${response.statusText}`);
    }

    const body = await response.json() as CheckCarDetailsResponse;

    if (body.message) {
      throw new VehicleNotFoundError(registration);
    }

    return {
      registration: body.registrationNumber ?? registration,
      source: "checkcardetails",
      make: (body.make ?? "UNKNOWN").toUpperCase(),
      model: body.model ? body.model.toUpperCase() : undefined,
      colour: body.colour ? body.colour.toUpperCase() : undefined,
      yearOfManufacture: body.yearOfManufacture,
      fuelType: body.fuelType ? body.fuelType.toUpperCase() : undefined,
      vehicleType: "car",
    };
  }
}

interface CheckCarDetailsResponse {
  message?: string;
  registrationNumber?: string;
  make?: string;
  model?: string;
  colour?: string;
  fuelType?: string;
  engineCapacity?: number;
  yearOfManufacture?: number;
  vehicleAge?: string;
  co2Emissions?: number;
  registrationPlace?: string;
  tax?: { taxStatus: string; taxDueDate: string; days: string | number };
  mot?: { motStatus: string; motDueDate: string; days: string | number };
}

import type { ManualVehicleEntry } from "@motorcover/shared-types";

/**
 * What we persist for a vehicle the customer described themselves.
 *
 * Deliberately the same shape a looked-up vehicle writes, so everything
 * downstream — quotes, pricing, documents — reads a manual vehicle exactly as
 * it reads a DVLA one. `source: "manual"` is the only thing that distinguishes
 * them, and it is what the admin UI badges as self-declared.
 */
export interface ManualVehicleRecord {
  registration: string;
  make: string;
  model: string;
  colour: string;
  yearOfManufacture: number;
  fuelType: string;
  vehicleType: ManualVehicleEntry["vehicleType"];
  source: "manual";
  rawLookupJson: {
    enteredManually: true;
    declaredAt: string;
    country: ManualVehicleEntry["country"];
  };
}

export function buildManualVehicleRecord(
  entry: ManualVehicleEntry,
  declaredAt: Date
): ManualVehicleRecord {
  // `detailsDeclared` and `country` are inputs to the decision, not vehicle
  // attributes — they belong in the audit payload, not in the columns that
  // describe the car.
  const { detailsDeclared: _declared, country, ...vehicle } = entry;

  return {
    ...vehicle,
    source: "manual",
    rawLookupJson: {
      enteredManually: true,
      declaredAt: declaredAt.toISOString(),
      country,
    },
  };
}

import type { VehicleLookupProvider, VehicleLookupResult } from "./types";
import { VehicleNotFoundError } from "./types";

/**
 * Deterministic fixture data, keyed by a hash of the registration so the same
 * plate always returns the same "vehicle" within a demo session — without
 * needing any external API or database of real vehicles.
 *
 * Special case: any registration starting with "FAIL" simulates a DVLA
 * not-found response, so the not-found UI/error path can be demoed on demand
 * (e.g. try "FAIL123").
 */
const FIXTURES: Omit<VehicleLookupResult, "registration" | "source">[] = [
  { make: "FORD", model: "FIESTA", colour: "BLUE", yearOfManufacture: 2019, fuelType: "PETROL", vehicleType: "car" },
  { make: "VAUXHALL", model: "CORSA", colour: "RED", yearOfManufacture: 2017, fuelType: "PETROL", vehicleType: "car" },
  { make: "VOLKSWAGEN", model: "GOLF", colour: "BLACK", yearOfManufacture: 2021, fuelType: "DIESEL", vehicleType: "car" },
  { make: "TOYOTA", model: "YARIS", colour: "WHITE", yearOfManufacture: 2020, fuelType: "HYBRID ELECTRIC", vehicleType: "car" },
  { make: "BMW", model: "1 SERIES", colour: "GREY", yearOfManufacture: 2018, fuelType: "DIESEL", vehicleType: "car" },
];

function hashToIndex(value: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) % 1_000_000;
  }
  return hash % modulo;
}

export class MockVehicleLookupProvider implements VehicleLookupProvider {
  readonly name = "mock" as const;

  async lookup(registration: string): Promise<VehicleLookupResult> {
    if (registration.startsWith("FAIL")) {
      throw new VehicleNotFoundError(registration);
    }

    const fixture = FIXTURES[hashToIndex(registration, FIXTURES.length)];

    return {
      registration,
      source: "mock",
      ...fixture,
    };
  }
}

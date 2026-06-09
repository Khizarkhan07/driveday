import { env } from "../../config/env";
import { CheckCarDetailsProvider } from "./check-car-details-provider";
import { DvlaVesVehicleLookupProvider } from "./dvla-ves-provider";
import { MockVehicleLookupProvider } from "./mock-provider";
import { OneAutoApiVehicleLookupProvider } from "./one-auto-api-provider";
import type { VehicleLookupProvider } from "./types";

let cached: VehicleLookupProvider | undefined;

export function getVehicleLookupProvider(): VehicleLookupProvider {
  if (cached) return cached;

  switch (env.vehicleLookupProvider) {
    case "checkcardetails":
      cached = new CheckCarDetailsProvider();
      break;
    case "oneautoapi":
      cached = new OneAutoApiVehicleLookupProvider();
      break;
    case "dvla":
      cached = new DvlaVesVehicleLookupProvider();
      break;
    case "mock":
    default:
      cached = new MockVehicleLookupProvider();
      break;
  }

  return cached;
}

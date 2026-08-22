import type { LookupCountry } from "@motorcover/shared-types";
import { env } from "../../config/env";
import { CheckCarDetailsProvider } from "./check-car-details-provider";
import { DvlaVesVehicleLookupProvider } from "./dvla-ves-provider";
import { MockVehicleLookupProvider } from "./mock-provider";
import { OneAutoApiVehicleLookupProvider } from "./one-auto-api-provider";
import { RegCheckIrelandProvider } from "./regcheck-ireland-provider";
import type { VehicleLookupProvider } from "./types";

let cachedUk: VehicleLookupProvider | undefined;
let cachedIe: VehicleLookupProvider | undefined;

/**
 * Ireland is served by RegCheck regardless of VEHICLE_LOOKUP_PROVIDER, which
 * only ever selected between UK sources. The mock provider still wins for both
 * countries so local development needs no external calls.
 */
export function getVehicleLookupProvider(
  country: LookupCountry = "uk"
): VehicleLookupProvider {
  if (env.vehicleLookupProvider === "mock") {
    cachedUk ??= new MockVehicleLookupProvider();
    return cachedUk;
  }

  if (country === "ie") {
    cachedIe ??= new RegCheckIrelandProvider();
    return cachedIe;
  }

  if (cachedUk) return cachedUk;

  switch (env.vehicleLookupProvider) {
    case "checkcardetails":
      cachedUk = new CheckCarDetailsProvider();
      break;
    case "oneautoapi":
      cachedUk = new OneAutoApiVehicleLookupProvider();
      break;
    case "dvla":
      cachedUk = new DvlaVesVehicleLookupProvider();
      break;
    default:
      cachedUk = new MockVehicleLookupProvider();
      break;
  }

  return cachedUk;
}

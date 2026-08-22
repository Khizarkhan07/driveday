import { classifyVehicleType } from "@motorcover/shared-types";
import { env } from "../../config/env";
import type { VehicleLookupProvider, VehicleLookupResult } from "./types";
import { ProviderNotConfiguredError, VehicleNotFoundError } from "./types";

const BASE_URL = "https://www.regcheck.org.uk/api/reg.asmx/CheckIreland";

/**
 * RegCheck returns XML whose single <vehicleJson> element contains a JSON
 * *string*, and most values are wrapped as { CurrentTextValue: "..." } rather
 * than being plain scalars. Both layers have to be unwrapped before the
 * response resembles anything usable.
 */
interface RegCheckWrapped {
  CurrentTextValue?: string;
}
type RegCheckValue = string | number | RegCheckWrapped | null | undefined;

export interface RegCheckIrelandResponse {
  Description?: RegCheckValue;
  RegistrationYear?: RegCheckValue;
  CarMake?: RegCheckValue;
  CarModel?: RegCheckValue;
  BodyStyle?: RegCheckValue;
  FuelType?: RegCheckValue;
  EngineSize?: RegCheckValue;
  NumberOfDoors?: RegCheckValue;
  NumberOfSeats?: RegCheckValue;
  VIN?: RegCheckValue;
  County?: RegCheckValue;
  ImageUrl?: RegCheckValue;
}

/** Unwraps { CurrentTextValue } and normalises blanks to undefined. */
export function unwrap(value: RegCheckValue): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object") {
    const inner = value.CurrentTextValue;
    return inner && inner.trim() ? inner.trim() : undefined;
  }
  const s = String(value).trim();
  return s ? s : undefined;
}

/** Pulls the JSON payload out of the XML envelope. */
export function extractVehicleJson(xml: string): RegCheckIrelandResponse {
  const match = /<vehicleJson>([\s\S]*?)<\/vehicleJson>/.exec(xml);
  if (!match) throw new Error("RegCheck response did not contain vehicleJson");
  return JSON.parse(match[1]) as RegCheckIrelandResponse;
}

/**
 * Maps a RegCheck Ireland response onto our provider contract.
 *
 * Two fields the UK provider supplies have no equivalent here: `colour` is not
 * returned at all, and there is no type approval or wheelplan, so
 * classifyVehicleType has nothing to work from and every Irish vehicle
 * classifies as "car". That is acceptable only because vehicle type no longer
 * affects pricing — see pricing.config.ts.
 */
export function mapRegCheckResponse(
  body: RegCheckIrelandResponse,
  registration: string
): VehicleLookupResult {
  const year = unwrap(body.RegistrationYear);
  const parsedYear = year ? Number(year) : undefined;

  return {
    registration,
    source: "regcheck",
    make: unwrap(body.CarMake)?.toUpperCase() ?? "UNKNOWN",
    model: unwrap(body.CarModel)?.toUpperCase(),
    colour: undefined,
    yearOfManufacture: Number.isFinite(parsedYear) ? parsedYear : undefined,
    fuelType: unwrap(body.FuelType)?.toUpperCase(),
    vehicleType: classifyVehicleType(undefined, undefined),
  };
}

export class RegCheckIrelandProvider implements VehicleLookupProvider {
  readonly name = "regcheck" as const;

  async lookup(registration: string): Promise<VehicleLookupResult> {
    if (!env.regCheckUsername) {
      throw new ProviderNotConfiguredError("RegCheck Ireland", ["REGCHECK_USERNAME"]);
    }

    const url =
      `${BASE_URL}?RegistrationNumber=${encodeURIComponent(registration)}` +
      `&username=${encodeURIComponent(env.regCheckUsername)}`;

    const response = await fetch(url, { method: "GET" });
    const text = await response.text();

    // Auth and not-found both come back as plain text with a 200, so the
    // status code alone cannot be trusted here.
    if (/username is incorrect/i.test(text)) {
      throw new ProviderNotConfiguredError("RegCheck Ireland", ["REGCHECK_USERNAME (rejected)"]);
    }
    if (!response.ok || !text.includes("<vehicleJson>")) {
      throw new VehicleNotFoundError(registration);
    }

    const body = extractVehicleJson(text);
    if (!unwrap(body.CarMake) && !unwrap(body.Description)) {
      throw new VehicleNotFoundError(registration);
    }

    return mapRegCheckResponse(body, registration);
  }
}

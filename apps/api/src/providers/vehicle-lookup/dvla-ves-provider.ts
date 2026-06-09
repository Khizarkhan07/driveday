import { env } from "../../config/env";
import type { VehicleLookupProvider, VehicleLookupResult } from "./types";
import { ProviderNotConfiguredError, VehicleNotFoundError } from "./types";

/**
 * Direct integration with DVLA's own Vehicle Enquiry Service (VES) API —
 * https://developer-portal.driver-vehicle-licensing.api.gov.uk — rather than
 * a paid commercial reseller. Spec: POST /v1/vehicles, auth via `x-api-key`,
 * request body `{ registrationNumber }`.
 *
 * Until DVLA_VES_API_KEY is set, this provider fails loudly via
 * ProviderNotConfiguredError rather than silently returning bad data — set
 * VEHICLE_LOOKUP_PROVIDER=mock to keep using fixture data in the meantime.
 */
export class DvlaVesVehicleLookupProvider implements VehicleLookupProvider {
  readonly name = "dvla" as const;

  private assertConfigured(): { baseUrl: string; apiKey: string } {
    const missing: string[] = [];
    if (!env.dvlaVesBaseUrl) missing.push("DVLA_VES_BASE_URL");
    if (!env.dvlaVesApiKey) missing.push("DVLA_VES_API_KEY");
    if (missing.length > 0) {
      throw new ProviderNotConfiguredError("DVLA Vehicle Enquiry Service", missing);
    }
    return { baseUrl: env.dvlaVesBaseUrl!, apiKey: env.dvlaVesApiKey! };
  }

  async lookup(registration: string): Promise<VehicleLookupResult> {
    const { baseUrl, apiKey } = this.assertConfigured();

    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/vehicles`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "X-Correlation-Id": crypto.randomUUID(),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ registrationNumber: registration }),
    });

    if (response.status === 404) {
      throw new VehicleNotFoundError(registration);
    }
    if (response.status === 400) {
      throw new Error(`DVLA VES rejected the registration "${registration}" as invalid`);
    }
    if (!response.ok) {
      throw new Error(`DVLA VES lookup failed: ${response.status} ${response.statusText}`);
    }

    const body = await response.json();
    return this.mapResponse(registration, body);
  }

  /**
   * Maps the DVLA VES response into our normalized VehicleLookupResult
   * contract. Note: the VES API does not return a `model` field at all (a
   * real limitation of the API, not a mapping gap), so it's left undefined —
   * the rest of the app already treats `model` as optional.
   */
  private mapResponse(registration: string, body: any): VehicleLookupResult {
    return {
      registration: body?.registrationNumber ?? registration,
      source: "dvla",
      make: body?.make ?? "UNKNOWN",
      model: undefined,
      colour: body?.colour ?? undefined,
      yearOfManufacture: body?.yearOfManufacture ?? undefined,
      fuelType: body?.fuelType ?? undefined,
      vehicleType: "car",
    };
  }
}

import { env } from "../../config/env";
import type { VehicleLookupProvider, VehicleLookupResult } from "./types";
import { ProviderNotConfiguredError, VehicleNotFoundError } from "./types";

/**
 * Stub implementation for One Auto API (https://oneautoapi.com), a commercial
 * reseller of DVLA vehicle data. NOT YET WIRED TO A REAL ACCOUNT.
 *
 * TODO once the user has signed up and has an API key:
 *   1. Confirm the exact endpoint path (this assumes a REST lookup-by-registration
 *      endpoint similar to `${ONEAUTOAPI_BASE_URL}/vehicle/{registration}`).
 *   2. Confirm the auth header shape (this assumes `Authorization: Bearer <key>`;
 *      One Auto API may instead expect an `x-api-key` header or query param).
 *   3. Confirm the exact response field names/casing and update the mapping
 *      in `mapResponse()` below — the rest of the app only ever sees the
 *      normalized `VehicleLookupResult` shape, so this is the ONLY place
 *      that needs to change once the real shape is known.
 *   4. Confirm how a "not found" result is signalled (HTTP 404 vs an empty
 *      body vs an error envelope) and adjust the not-found branch accordingly.
 *
 * Until ONEAUTOAPI_KEY is set, this provider fails loudly via
 * ProviderNotConfiguredError rather than silently returning bad data — set
 * VEHICLE_LOOKUP_PROVIDER=mock to keep using fixture data in the meantime.
 */
export class OneAutoApiVehicleLookupProvider implements VehicleLookupProvider {
  readonly name = "oneautoapi" as const;

  private assertConfigured(): { baseUrl: string; apiKey: string } {
    const missing: string[] = [];
    if (!env.oneAutoApiBaseUrl) missing.push("ONEAUTOAPI_BASE_URL");
    if (!env.oneAutoApiKey) missing.push("ONEAUTOAPI_KEY");
    if (missing.length > 0) {
      throw new ProviderNotConfiguredError("One Auto API", missing);
    }
    return { baseUrl: env.oneAutoApiBaseUrl!, apiKey: env.oneAutoApiKey! };
  }

  async lookup(registration: string): Promise<VehicleLookupResult> {
    const { baseUrl, apiKey } = this.assertConfigured();

    // TODO: confirm exact path — placeholder shape based on typical reseller APIs
    const url = `${baseUrl.replace(/\/$/, "")}/vehicle/${encodeURIComponent(registration)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        // TODO: confirm header name — could be `x-api-key` instead of Bearer
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      throw new VehicleNotFoundError(registration);
    }
    if (!response.ok) {
      throw new Error(
        `One Auto API lookup failed: ${response.status} ${response.statusText}`
      );
    }

    const body = await response.json();
    return this.mapResponse(registration, body);
  }

  /**
   * Maps the (currently assumed) One Auto API response shape into our
   * normalized VehicleLookupResult contract. Update the field accessors here
   * — and only here — once the real response shape is confirmed.
   */
  private mapResponse(registration: string, body: any): VehicleLookupResult {
    return {
      registration,
      source: "oneautoapi",
      make: body?.make ?? body?.Make ?? "UNKNOWN",
      model: body?.model ?? body?.Model ?? undefined,
      colour: body?.colour ?? body?.Colour ?? undefined,
      yearOfManufacture:
        body?.yearOfManufacture ?? body?.YearOfManufacture ?? undefined,
      fuelType: body?.fuelType ?? body?.FuelType ?? undefined,
      vehicleType: "car",
    };
  }
}

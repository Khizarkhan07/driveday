import type { VehicleLookupResult } from "@motorcover/shared-types";

export type { VehicleLookupResult };

export class VehicleNotFoundError extends Error {
  constructor(registration: string) {
    super(`No vehicle found for registration "${registration}"`);
    this.name = "VehicleNotFoundError";
  }
}

export class ProviderNotConfiguredError extends Error {
  constructor(providerName: string, missingVars: string[]) {
    super(
      `${providerName} is not configured. Missing env vars: ${missingVars.join(", ")}. ` +
        `Set VEHICLE_LOOKUP_PROVIDER=mock to use the mock provider instead.`
    );
    this.name = "ProviderNotConfiguredError";
  }
}

/**
 * Every vehicle data source (mock fixtures, One Auto API, or DVLA directly in
 * future) implements this single contract. The rest of the app only ever
 * depends on this interface, so swapping providers is a one-file + one-env-var
 * change — see factory.ts.
 */
export interface VehicleLookupProvider {
  readonly name: "mock" | "oneautoapi" | "dvla" | "checkcardetails";
  lookup(registration: string): Promise<VehicleLookupResult>;
}

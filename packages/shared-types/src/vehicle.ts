import { z } from "zod";

/** UK number plate formats (current 2001-style + older formats), case-insensitive. */
export const ukRegistrationSchema = z
  .string()
  .trim()
  .toUpperCase()
  .min(2)
  .max(8)
  .regex(/^[A-Z0-9]+$/, "Registration must only contain letters and numbers");

export const vehicleLookupRequestSchema = z.object({
  registration: ukRegistrationSchema,
});
export type VehicleLookupRequest = z.infer<typeof vehicleLookupRequestSchema>;

export const vehicleLookupResultSchema = z.object({
  registration: z.string(),
  make: z.string(),
  model: z.string().optional(),
  colour: z.string().optional(),
  yearOfManufacture: z.number().int().optional(),
  fuelType: z.string().optional(),
  vehicleType: z.enum(["car", "van", "motorcycle", "other"]).default("car"),
  source: z.enum(["mock", "oneautoapi", "dvla", "checkcardetails"]),
});
export type VehicleLookupResult = z.infer<typeof vehicleLookupResultSchema>;

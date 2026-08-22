import { z } from "zod";

/** Which country's register a lookup should be run against. */
export const lookupCountrySchema = z.enum(["uk", "ie"]);
export type LookupCountry = z.infer<typeof lookupCountrySchema>;

/**
 * Strips the separators people naturally type. UK plates are commonly written
 * "AB12 CDE" and Irish ones "161-D-12345"; neither separator is part of the
 * registration itself.
 */
export function normalizeRegistration(raw: string): string {
  return raw.trim().toUpperCase().replace(/[\s-]/g, "");
}

/** UK number plate formats (current 2001-style + older formats), case-insensitive. */
export const ukRegistrationSchema = z
  .string()
  .transform(normalizeRegistration)
  .pipe(
    z
      .string()
      .min(2)
      .max(8)
      .regex(/^[A-Z0-9]+$/, "Registration must only contain letters and numbers")
  );

/**
 * Irish format: two or three year digits (the third marks the half-year from
 * 2013), a one or two letter county code, then a one to six digit sequence.
 * Written "161-D-12345"; normalised here to "161D12345".
 */
export const irishRegistrationSchema = z
  .string()
  .transform(normalizeRegistration)
  .pipe(
    z
      .string()
      .regex(
        /^\d{2,3}[A-Z]{1,2}\d{1,6}$/,
        "Enter a valid Irish registration, e.g. 161-D-12345"
      )
  );

/** Picks the right registration format for the country being searched. */
export function registrationSchemaFor(country: LookupCountry) {
  return country === "ie" ? irishRegistrationSchema : ukRegistrationSchema;
}

export const vehicleLookupRequestSchema = z
  .object({
    registration: z.string(),
    country: lookupCountrySchema.default("uk"),
  })
  .superRefine((value, ctx) => {
    const parsed = registrationSchemaFor(value.country).safeParse(value.registration);
    if (!parsed.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["registration"],
        message: parsed.error.issues[0]?.message ?? "Invalid registration",
      });
    }
  })
  .transform((value) => ({
    ...value,
    registration: normalizeRegistration(value.registration),
  }));
export type VehicleLookupRequest = z.infer<typeof vehicleLookupRequestSchema>;

export const vehicleLookupResultSchema = z.object({
  registration: z.string(),
  make: z.string(),
  model: z.string().optional(),
  colour: z.string().optional(),
  yearOfManufacture: z.number().int().optional(),
  fuelType: z.string().optional(),
  vehicleType: z.enum(["car", "van", "motorcycle", "hgv", "other"]).default("car"),
  source: z.enum(["mock", "oneautoapi", "dvla", "checkcardetails", "regcheck"]),
});
export type VehicleLookupResult = z.infer<typeof vehicleLookupResultSchema>;

export type VehicleType = VehicleLookupResult["vehicleType"];

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  car: "Car",
  van: "Van",
  motorcycle: "Motorcycle",
  hgv: "HGV",
  other: "Other",
};

/**
 * Derives our vehicle type from DVLA data.
 *
 * `typeApproval` is the EU vehicle category and the authoritative signal:
 *   M1        passenger car        -> car
 *   M2 / M3   bus / coach          -> other
 *   N1        goods up to 3.5t     -> van
 *   N2 / N3   goods over 3.5t      -> hgv
 *   L1..L7    mopeds / motorcycles -> motorcycle
 *   O1..O4    trailers             -> other
 *
 * EU type approval only became mandatory in the UK from the mid-90s, so
 * pre-1996 vehicles come back with it null (a 1961 Triumph returns no
 * category but a "2 WHEEL" wheelplan). `wheelplan` is the fallback for those.
 *
 * Anything unrecognised falls back to "car", matching the schema default —
 * a lookup should never fail because of an unfamiliar category code.
 */
export function classifyVehicleType(
  typeApproval?: string | null,
  wheelplan?: string | null
): VehicleType {
  const code = typeApproval?.trim().toUpperCase() ?? "";

  if (code) {
    // Category letter plus its first digit; "L3e" and "L3" both yield L/3.
    const letter = code[0];
    const digit = code[1];

    if (letter === "L") return "motorcycle";
    if (letter === "M") return digit === "1" ? "car" : "other";
    if (letter === "N") return digit === "1" ? "van" : "hgv";
    if (letter === "O" || letter === "T" || letter === "C") return "other";
  }

  return classifyByWheelplan(wheelplan);
}

function classifyByWheelplan(wheelplan?: string | null): VehicleType {
  const plan = wheelplan?.trim().toUpperCase() ?? "";
  if (!plan) return "car";

  // "2 WHEEL" / "3 WHEEL" describe bikes and trikes; anything measured in
  // axles is a four-wheeled vehicle.
  if (plan.includes("WHEEL") && !plan.includes("AXLE")) return "motorcycle";
  if (plan.includes("ARTICULATED")) return "hgv";

  const axles = Number(/^(\d+)\s*AXLE/.exec(plan)?.[1] ?? 0);
  if (axles >= 3) return "hgv";

  // A 2-axle rigid body is a car, a van or a small truck — indistinguishable
  // without a category code, so take the most common case.
  return "car";
}

import { z } from "zod";
import type { CoverType } from "./quote";
import type { LookupCountry } from "./vehicle";

/**
 * A market is a configuration of this application, not a version of it. Both
 * the UK and Irish deployments run the same commit; `MARKET` (API) and
 * `VITE_MARKET` (web) select which row of the table below applies.
 *
 * Everything that differs between markets belongs here, so that consuming code
 * reads values rather than branching on the market itself — and so that adding
 * a third market is a data change.
 */

export const MARKET_CODES = ["uk", "ie"] as const;
export const marketCodeSchema = z.enum(MARKET_CODES);
export type MarketCode = z.infer<typeof marketCodeSchema>;

export const CURRENCY_CODES = ["gbp", "eur"] as const;
export const currencyCodeSchema = z.enum(CURRENCY_CODES);
export type CurrencyCode = z.infer<typeof currencyCodeSchema>;

export interface MarketConfig {
  code: MarketCode;
  /** Which vehicle register this market looks up against. Fixed, never inferred. */
  country: LookupCountry;

  currency: CurrencyCode;
  locale: string;
  timeZone: string;
  /** Flat 1-day rate in minor units, by cover type. */
  coverTypeRates: Record<CoverType, number>;

  /**
   * Which vehicle registers this market may search, most common first.
   *
   * The first entry is the default. A market with more than one lets the
   * customer choose — the UK site has always allowed an Irish registration to
   * be searched — but a register absent from this list cannot be reached from
   * this market however the request is framed.
   */
  lookupCountries: readonly LookupCountry[];

  /**
   * Driving licence number format. `null` means no format check — used where we
   * have no supplied pattern for the market and would otherwise be inventing
   * one. The field is optional either way, so a driver can always decline.
   */
  licencePattern: RegExp | null;
  licenceMessage: string;
  licencePlaceholder: string;

  /** What this market calls the postal code. */
  postalCodeLabel: string;

  /** Company details that appear on documents and in page footers. */
  company: CompanyDetails;

  /**
   * Inserted into issued policy numbers. `null` keeps the original UK format,
   * which must not change — live UK policies carry it.
   */
  policyNumberPrefix: string | null;
}

/**
 * How each country's plate looks and validates.
 *
 * Per country rather than per market, because a market may search more than
 * one register: the UK form has to restyle itself to an Irish plate when the
 * customer says the vehicle is Irish.
 */
export interface CountryPlate {
  badgeLabel: string;
  background: string;
  badgeBackground: string;
  badgeColor: string;
  placeholder: string;
  maxLength: number;
  /** Shown when a registration does not match this country's format. */
  errorMessage: string;
}

export const COUNTRY_PLATES: Record<LookupCountry, CountryPlate> = {
  uk: {
    badgeLabel: "UK",
    background: "#ffd80a",
    badgeBackground: "#063298",
    badgeColor: "#ffd80a",
    placeholder: "AB12 CDE",
    maxLength: 8,
    errorMessage: "Enter a valid UK registration number",
  },
  // Irish plates are black on white with a blue EU band reading IRL.
  ie: {
    badgeLabel: "IRL",
    background: "#ffffff",
    badgeBackground: "#063298",
    badgeColor: "#ffffff",
    placeholder: "161-D-12345",
    maxLength: 12,
    errorMessage: "Enter a valid Irish registration number, e.g. 161-D-12345",
  },
};

/**
 * The company identity printed on documents and in footers.
 *
 * Only the address varies today. The registration jurisdiction, company number
 * and regulator still describe the England and Wales entity in both markets —
 * which is why the Irish address is introduced as an office rather than a
 * registered office: calling it registered would contradict the registration
 * the same documents carry.
 */
export interface CompanyDetails {
  address: string;
  /** Sentence-initial, e.g. "Registered address: …". */
  addressHeading: string;
  /** Mid-sentence, e.g. "… Registered office — …". */
  addressTerm: string;
}

export const MARKETS: Record<MarketCode, MarketConfig> = {
  uk: {
    code: "uk",
    country: "uk",
    currency: "gbp",
    locale: "en-GB",
    timeZone: "Europe/London",
    coverTypeRates: { PERSONAL: 1500, BUSINESS: 2500 },
    // The UK site has always let a customer search an Irish registration.
    lookupCountries: ["uk", "ie"],
    licencePattern: /^[A-Z9]{5}\d{6}[A-Z9]{2}\d[A-Z]{2}$/i,
    licenceMessage: "Enter a valid UK driving licence number (e.g. MORGA753116SM9IJ)",
    licencePlaceholder: "MORGA753116SM9IJ",
    postalCodeLabel: "Postcode",
    company: {
      address: "37th Floor, 1 Canada Square, Canary Wharf Estate, London E14 5AA",
      addressHeading: "Registered address",
      addressTerm: "Registered office",
    },
    policyNumberPrefix: null,
  },
  ie: {
    code: "ie",
    country: "ie",
    currency: "eur",
    locale: "en-IE",
    timeZone: "Europe/Dublin",
    // Same figures as the UK, denominated in euro.
    coverTypeRates: { PERSONAL: 1500, BUSINESS: 2500 },
    // Ireland has its own documents and never searches the UK register.
    lookupCountries: ["ie"],
    // No supplied Irish format, and inventing one would reject valid licences.
    licencePattern: null,
    licenceMessage: "Enter your driving licence number",
    licencePlaceholder: "",
    postalCodeLabel: "Eircode",
    company: {
      address: "31-36 Ormond Quay Upper, Dublin, D07 EE37, Ireland",
      addressHeading: "Office address",
      addressTerm: "Office",
    },
    policyNumberPrefix: "IE",
  },
};

/**
 * Which register a request should actually search.
 *
 * A requested country is honoured only when the market is permitted to search
 * it; anything else falls back to the market's default. The request body is
 * therefore never able to reach a register the deployment does not allow.
 */
export function resolveLookupCountry(
  market: MarketConfig,
  requested: LookupCountry | undefined
): LookupCountry {
  return requested && market.lookupCountries.includes(requested)
    ? requested
    : market.lookupCountries[0];
}

export function marketFor(code: MarketCode): MarketConfig {
  return MARKETS[code];
}

/**
 * Resolves the configured market, rejecting anything unrecognised.
 *
 * Deliberately throws rather than defaulting: a deployment whose `MARKET` is
 * missing or misspelled must fail at boot, not quietly serve the other
 * market's currency, plate format and register.
 */
export function resolveMarket(raw: string | undefined): MarketConfig {
  const parsed = marketCodeSchema.safeParse(raw?.trim().toLowerCase());
  if (!parsed.success) {
    throw new Error(
      `MARKET must be one of ${MARKET_CODES.join(", ")} — received ${
        raw === undefined ? "nothing" : JSON.stringify(raw)
      }`
    );
  }
  return MARKETS[parsed.data];
}

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = { gbp: "£", eur: "€" };

/**
 * Formats a minor-unit amount for display.
 *
 * Takes the currency explicitly rather than reading the configured market,
 * because documents and emails are rendered for a *stored* quote: the currency
 * that applied when it was priced, which must not be reinterpreted later.
 */
export function formatMoney(pence: number, currency: string): string {
  const code = currency.toLowerCase();
  const symbol = CURRENCY_SYMBOLS[code as CurrencyCode];
  const amount = (pence / 100).toFixed(2);
  return symbol ? `${symbol}${amount}` : `${code.toUpperCase()} ${amount}`;
}

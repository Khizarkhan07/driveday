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
 * The Irish market states Ireland as the place of registration and as the
 * governing law, by the product owner's decision. The regulator named on the
 * documents is still the FCA in both markets, so the Irish address is
 * introduced as an office rather than a registered office.
 *
 * `companyNumber` is null for Ireland because 05044963 is a Companies House
 * number: printing it beside an Irish registration would state something
 * untrue. Supply a CRO number and the documents will carry it.
 */
export interface CompanyDetails {
  address: string;
  /** Sentence-initial, e.g. "Registered address: …". */
  addressHeading: string;
  /** Mid-sentence, e.g. "… Registered office — …". */
  addressTerm: string;

  /** Where Day Drive Ltd is stated to be registered. */
  registrationJurisdiction: string;
  /**
   * Company registration number as printed on documents. `null` where no
   * number is known for that jurisdiction — a UK Companies House number
   * alongside an Irish registration would state something untrue, so the
   * Irish documents omit it until a CRO number is supplied.
   */
  companyNumber: string | null;
  /** The same, for the footer on the web app, which cites a different number. */
  webCompanyNumber: string | null;
  /** Where the underwriter is stated to be registered. */
  underwriterJurisdiction: string;
  /** The law and courts named in the Terms of Business. */
  governingLaw: string;

  /**
   * The market line in the logo, set in the brand blue between the wordmark
   * and the descriptor. `null` leaves the mark as the wordmark alone.
   */
  logoMarketLine: string | null;
  /** The website printed on documents, without a scheme. */
  website: string;
  /**
   * The entity named in the trademark line, which follows the market's domain.
   * Held as a value rather than derived from `website` because a legal entity
   * name is not really a function of a domain — if an Irish company is
   * registered under a different name, this is the one place to change.
   */
  tradingEntity: string;
  /**
   * Appended after "our Contact Centre" on the certificate. The UK certificate
   * says "Contact Centre (UK)"; the Irish one names no region.
   */
  contactCentreSuffix: string;

  /** "United Kingdom" / "Ireland" — formal name in declarations. */
  countryFull: string;
  /** "UK" / "Ireland" — short form, e.g. "Country of Issue". */
  countryShort: string;
  /** "UK" / "Irish" — adjectival, e.g. "a Full Irish Driving Licence". */
  countryAdjective: string;
  /**
   * With its article where one is needed: "the UK" takes one, "Ireland" does
   * not. Used mid-sentence, e.g. "will not be exported from the UK".
   */
  countryWithArticle: string;
  /**
   * The acceptable-licence declaration, in full. Kept whole rather than
   * assembled from the country name because the article changes with it:
   * "a United Kingdom Provisional" against "an Irish Provisional".
   */
  licenceDeclaration: string;
  /** The data protection regime named in the Terms of Business. */
  dataProtectionLaw: string;
  /** The data protection regulator the company is registered with. */
  dataProtectionAuthority: string;
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
      registrationJurisdiction: "England and Wales",
      companyNumber: "05044963",
      webCompanyNumber: "04596433",
      underwriterJurisdiction: "England and Wales",
      governingLaw: "England and Wales",
      logoMarketLine: null,
      website: "daydrive.co.uk",
      tradingEntity: "Daydrive.co.uk Limited",
      contactCentreSuffix: " (UK)",
      countryFull: "United Kingdom",
      countryShort: "UK",
      countryAdjective: "UK",
      countryWithArticle: "the UK",
      licenceDeclaration:
        "Hold a Full United Kingdom driving licence, Full EU or Full EEA Driver's License, or a United Kingdom Provisional Drivers licence;",
      dataProtectionLaw:
        "UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018",
      dataProtectionAuthority: "Information Commissioner's Office (ICO)",
    },
    policyNumberPrefix: null,
  },
  ie: {
    code: "ie",
    country: "ie",
    currency: "eur",
    locale: "en-IE",
    timeZone: "Europe/Dublin",
    // Priced independently of the UK: €18 personal, €30 business.
    coverTypeRates: { PERSONAL: 1800, BUSINESS: 3000 },
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
      registrationJurisdiction: "Ireland",
      // No Irish CRO number supplied; omitted rather than reusing the UK one.
      companyNumber: null,
      webCompanyNumber: null,
      underwriterJurisdiction: "Ireland",
      governingLaw: "Ireland",
      logoMarketLine: "IRELAND",
      website: "driveday-ie.com",
      tradingEntity: "Driveday-ie.com Limited",
      contactCentreSuffix: "",
      countryFull: "Ireland",
      countryShort: "Ireland",
      countryAdjective: "Irish",
      countryWithArticle: "Ireland",
      licenceDeclaration:
        "Hold a Full Irish driving licence, Full EU or Full EEA Driver's License, or an Irish Provisional Drivers licence;",
      dataProtectionLaw:
        "General Data Protection Regulation (GDPR) and the Data Protection Act 2018",
      dataProtectionAuthority: "Data Protection Commission (DPC)",
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

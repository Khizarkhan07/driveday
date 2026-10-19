import { formatMoney, resolveMarket, type MarketConfig } from "@motorcover/shared-types";

/**
 * The market this build serves, from `VITE_MARKET`.
 *
 * Resolved once at module load and deliberately not defaulted: a build with a
 * missing or misspelled `VITE_MARKET` must fail rather than quietly ship the
 * other market's currency, plate format and vehicle register.
 */
export const market: MarketConfig = resolveMarket(import.meta.env.VITE_MARKET);

/** Formats a minor-unit amount in this market's currency. */
export function money(pence: number): string {
  return formatMoney(pence, market.currency);
}

/**
 * Formats an amount in the currency it was priced in.
 *
 * Use this wherever the figure comes from a stored quote or policy, so a
 * historical record is never relabelled with today's market currency.
 */
export function moneyIn(pence: number, currency: string): string {
  return formatMoney(pence, currency);
}

/** Date and time formatting in this market's locale and time zone. */
export function formatDateTime(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium", timeStyle: "short" }
): string {
  return new Date(value).toLocaleString(market.locale, {
    timeZone: market.timeZone,
    ...options,
  });
}

export function formatDate(
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  return new Date(value).toLocaleDateString(market.locale, {
    timeZone: market.timeZone,
    ...options,
  });
}

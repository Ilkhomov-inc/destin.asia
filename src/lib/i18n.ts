import { LOCALES, type L, type LList, type Locale } from "./types";

export const hasLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/** Pick the string for the locale, falling back to Russian when the Uzbek copy is empty. */
export function tr(value: L | undefined | null, locale: Locale): string {
  if (!value) return "";
  return value[locale]?.trim() ? value[locale] : value.ru;
}

export function trList(value: LList | undefined | null, locale: Locale): string[] {
  if (!value) return [];
  return value[locale]?.length ? value[locale] : value.ru;
}

export const emptyL = (): L => ({ ru: "", uz: "" });
export const emptyLList = (): LList => ({ ru: [], uz: [] });

/** Prefix an internal path with the locale. */
export const href = (locale: Locale, path = "") => `/${locale}${path === "/" ? "" : path}`;

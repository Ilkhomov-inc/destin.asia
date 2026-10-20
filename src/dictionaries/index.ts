import type { Locale } from "@/lib/types";
import ru, { type Dict } from "./ru";
import uz from "./uz";

const dicts: Record<Locale, Dict> = { ru, uz };

export const getDict = (locale: Locale): Dict => dicts[locale];
export type { Dict };

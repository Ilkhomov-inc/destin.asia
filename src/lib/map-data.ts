import { travelLabel } from "@/components/site/location-card";
import { tr } from "./i18n";
import type { Category, Locale, Location, Tour } from "./types";

export type MapLocation = {
  id: string;
  slug: string;
  title: string;
  short: string;
  category: Category;
  cover: string;
  travel: string | null;
  lat: number;
  lng: number;
};
export type MapTour = { id: string; title: string; location_ids: string[] };

export function toMapData(locations: Location[], tours: Tour[], locale: Locale): { locations: MapLocation[]; tours: MapTour[] } {
  return {
    locations: locations
      .filter((l) => l.lat !== null && l.lng !== null)
      .map((l) => ({
        id: l.id,
        slug: l.slug,
        title: tr(l.title, locale),
        short: tr(l.short, locale),
        category: l.category,
        cover: l.cover,
        travel: travelLabel(locale, l.travel_min),
        lat: l.lat!,
        lng: l.lng!,
      })),
    tours: tours.map((t) => ({ id: t.id, title: tr(t.title, locale), location_ids: t.location_ids })),
  };
}

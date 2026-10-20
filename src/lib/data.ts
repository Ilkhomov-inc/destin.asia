import "server-only";
import { cache } from "react";
import { seedSettings } from "@/content/seed";
import { store } from "./store";
import type { Location, Review, Settings, Tour, Vehicle } from "./types";

const bySort = <T extends { sort: number }>(a: T, b: T) => a.sort - b.sort;
const published = <T extends { status: string }>(r: T) => r.status === "published";

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await store.all("settings");
  return { ...seedSettings, ...(rows.find((r) => r.id === "main") ?? {}) };
});

export const getLocations = cache(async (): Promise<Location[]> =>
  (await store.all("locations")).filter(published).sort(bySort),
);

export const getLocation = cache(async (slug: string) =>
  (await getLocations()).find((l) => l.slug === slug) ?? null,
);

export const getTours = cache(async (): Promise<Tour[]> =>
  (await store.all("tours")).filter(published).sort(bySort),
);

export const getTour = cache(async (slug: string) => (await getTours()).find((t) => t.slug === slug) ?? null);

export const getVehicles = cache(async (): Promise<Vehicle[]> =>
  (await store.all("vehicles")).filter(published).sort(bySort),
);

export const getReviews = cache(async (): Promise<Review[]> =>
  (await store.all("reviews")).filter(published).sort((a, b) => b.created_at.localeCompare(a.created_at)),
);

/** Resolve a tour's ordered route into published locations. */
export function routeOf(tour: Tour, locations: Location[]) {
  return tour.location_ids.map((id) => locations.find((l) => l.id === id)).filter((l): l is Location => !!l);
}

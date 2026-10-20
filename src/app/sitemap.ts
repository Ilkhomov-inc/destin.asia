import type { MetadataRoute } from "next";
import { getLocations, getTours } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { LOCALES } from "@/lib/types";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [locations, tours] = await Promise.all([getLocations(), getTours()]);
  const paths = ["", "/locations", "/tours", "/transport", "/build", "/about", "/contacts", ...locations.map((l) => `/locations/${l.slug}`), ...tours.map((t) => `/tours/${t.slug}`)];
  return paths.map((p) => ({
    url: `${SITE_URL}/ru${p}`,
    alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}`])) },
    changeFrequency: "weekly",
    priority: p === "" ? 1 : p.split("/").length > 2 ? 0.7 : 0.8,
  }));
}

import { notFound } from "next/navigation";
import { LocationBrowser } from "@/components/site/location-browser";
import { LocationCard } from "@/components/site/location-card";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/section";
import { RegionMap } from "@/components/site/region-map";
import { getDict } from "@/dictionaries";
import { getLocations, getTours } from "@/lib/data";
import { hasLocale, tr } from "@/lib/i18n";
import { toMapData } from "@/lib/map-data";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/locations">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, "/locations", d.locations.title, d.locations.text);
}

export default async function LocationsPage({ params }: PageProps<"/[lang]/locations">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const [locations, tours] = await Promise.all([getLocations(), getTours()]);
  const map = toMapData(locations, tours, lang);
  return (
    <>
      <PageHero eyebrow={d.nav.locations} title={d.locations.title} text={d.locations.text} />
      <section className="py-12 sm:py-16">
        <Container>
          <LocationBrowser
            locale={lang}
            items={locations.map((l) => ({
              id: l.id,
              category: l.category,
              haystack: [l.title.ru, l.title.uz, l.region, tr(l.short, lang)].join(" ").toLowerCase(),
              node: <LocationCard location={l} locale={lang} className="h-full" />,
            }))}
          />
        </Container>
      </section>
      <section className="topo-bg border-t border-line py-16 sm:py-20">
        <Container>
          <h2 className="mb-8 font-display text-3xl font-semibold">{d.home.mapTitle}</h2>
          <RegionMap locations={map.locations} tours={map.tours} locale={lang} />
        </Container>
      </section>
    </>
  );
}

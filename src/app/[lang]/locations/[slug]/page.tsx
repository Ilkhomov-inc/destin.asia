import { Navigation, Ticket, Timer } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToTour } from "@/components/site/add-to-tour";
import { Gallery } from "@/components/site/gallery";
import { travelLabel, LocationCard } from "@/components/site/location-card";
import { Container, Eyebrow } from "@/components/site/section";
import { TourCard } from "@/components/site/tour-card";
import { buttonClass } from "@/components/ui/button";
import { LocationMap } from "@/components/ui/expanded-map";
import { getDict } from "@/dictionaries";
import { getLocation, getLocations, getSettings, getTours, routeOf } from "@/lib/data";
import { hasLocale, tr, trList } from "@/lib/i18n";
import { attractionLd, JsonLd, pageMeta } from "@/lib/seo";
import { LOCALES } from "@/lib/types";
import { Sheet } from "@/components/site/sheet";

export async function generateStaticParams() {
  const locations = await getLocations();
  return LOCALES.flatMap((lang) => locations.map((l) => ({ lang, slug: l.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/locations/[slug]">) {
  const { lang, slug } = await params;
  const l = hasLocale(lang) ? await getLocation(slug) : null;
  if (!l || !hasLocale(lang)) return {};
  return pageMeta(lang, `/locations/${l.slug}`, tr(l.title, lang), tr(l.short, lang), l.cover);
}

export default async function LocationPage({ params }: PageProps<"/[lang]/locations/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const location = await getLocation(slug);
  if (!location) notFound();
  const d = getDict(lang);
  const [locations, tours, settings] = await Promise.all([getLocations(), getTours(), getSettings()]);
  const inTours = tours.filter((t) => t.location_ids.includes(location.id));
  const others = locations.filter((l) => l.id !== location.id).slice(0, 4);
  const title = tr(location.title, lang);
  const travel = travelLabel(lang, location.travel_min);
  const facts = [
    { icon: Timer, label: d.locations.duration, value: tr(location.duration, lang) },
    { icon: Navigation, label: d.locations.travel, value: travel },
    { icon: Ticket, label: d.locations.tickets, value: tr(location.price_note, lang) },
  ].filter((f) => f.value);

  return (
    <>
      <Sheet flatTop>
      <JsonLd data={attractionLd(location, lang)} />
      <section className="pt-24 sm:pt-28">
        <Container>
          <nav className="mb-5 text-sm text-ink-soft">
            <Link href={`/${lang}/locations`} className="hover:text-ink">
              {d.nav.locations}
            </Link>{" "}
            / <span className="text-ink">{title}</span>
          </nav>
          <Gallery images={location.images.length ? location.images : [location.cover].filter(Boolean)} alt={title} />
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            <Eyebrow>
              {d.categories[location.category]} · {location.region}
            </Eyebrow>
            <h1 className="mt-4 font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-5 text-xl leading-relaxed text-ink">{tr(location.short, lang)}</p>
            <div className="mt-6 space-y-4 text-[17px] leading-relaxed whitespace-pre-line text-ink-soft">{tr(location.description, lang)}</div>
            {trList(location.highlights, lang).length > 0 && (
              <div className="mt-10">
                <h2 className="font-display text-2xl font-semibold">{d.locations.highlights}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {trList(location.highlights, lang).map((h, i) => (
                    <li key={h} className="flex gap-3 rounded-2xl bg-white p-4 shadow-card">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-route/10 font-display text-xs font-bold text-route">{i + 1}</span>
                      <span className="text-[15px] font-medium">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card bg-white p-6 shadow-card">
              <dl className="space-y-4">
                {facts.map((f) => (
                  <div key={f.label} className="flex gap-3">
                    <f.icon className="mt-0.5 size-5 shrink-0 text-route" />
                    <div>
                      <dt className="text-xs font-bold tracking-wider text-ink-soft uppercase">{f.label}</dt>
                      <dd className="mt-0.5 text-[15px] font-medium">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              {location.lat !== null && location.lng !== null && (
                <LocationMap className="mt-6" location={`${title} · ${location.region}`} latitude={location.lat} longitude={location.lng} zoom={15} fluid />
              )}
              <div className="mt-6 flex flex-col gap-3">
                <AddToTour id={location.id} locale={lang} size="lg" className="w-full justify-center border border-ink/10" />
                <Link href={`/${lang}/build`} className={buttonClass("primary", "lg", "w-full")}>
                  {d.build.openBuilder}
                </Link>
                {location.lat !== null && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`} target="_blank" rel="noopener" className={buttonClass("ghost", "md", "w-full")}>
                    {d.common.openMap}
                  </a>
                )}
              </div>
            </div>
          </aside>
        </Container>
      </section>

      {inTours.length > 0 && (
        <section className="bg-paper-2/60 py-16">
          <Container>
            <h2 className="mb-8 font-display text-3xl font-semibold">{d.locations.inTours}</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inTours.map((t) => (
                <TourCard key={t.id} tour={t} route={routeOf(t, locations)} locale={lang} rates={settings.rates} />
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="py-16">
        <Container>
          <h2 className="mb-8 font-display text-3xl font-semibold">{d.locations.other}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {others.map((l) => (
              <LocationCard key={l.id} location={l} locale={lang} className="h-full" />
            ))}
          </div>
        </Container>
      </section>
      </Sheet>
    </>
  );
}

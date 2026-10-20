import { ArrowRight, Camera, Car, Footprints, Languages, MessageCircle, UtensilsCrossed } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CinematicHero } from "@/components/site/hero/cinematic-hero";
import { DescentHero } from "@/components/site/hero/descent-hero";
import { Faq } from "@/components/site/faq";
import { InfoGrid } from "@/components/site/info-grid";
import { LocationCard } from "@/components/site/location-card";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionHead } from "@/components/site/section";
import { RegionMap } from "@/components/site/region-map";
import { TourCard } from "@/components/site/tour-card";
import { VehicleCard } from "@/components/site/vehicle-card";
import { buttonClass } from "@/components/ui/button";
import { getDict } from "@/dictionaries";
import { getLocations, getReviews, getSettings, getTours, getVehicles, routeOf } from "@/lib/data";
import { hasLocale, tr } from "@/lib/i18n";
import { toMapData } from "@/lib/map-data";
import { JsonLd, organizationLd } from "@/lib/seo";
import { HERO } from "@/content/hero";

const LEGEND_ICONS = [Languages, Car, Footprints, Camera, UtensilsCrossed, MessageCircle];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const [settings, locations, tours, vehicles, reviews] = await Promise.all([getSettings(), getLocations(), getTours(), getVehicles(), getReviews()]);
  const map = toMapData(locations, tours, lang);
  const featured = tours.filter((t) => t.featured).slice(0, 3);
  const showcase = (featured.length ? featured : tours).slice(0, 3);

  const moreLink = (href: string, label: string) => (
    <Link href={`/${lang}${href}`} className={buttonClass("outline", "md", "self-start md:self-auto")}>
      {label} <ArrowRight className="size-4" />
    </Link>
  );

  return (
    <>
      <JsonLd data={organizationLd(settings, lang)} />
      {HERO ? (
        <CinematicHero locale={lang} title={tr(settings.hero_title, lang)} subtitle={tr(settings.hero_subtitle, lang)} config={HERO} />
      ) : (
        <DescentHero locale={lang} title={tr(settings.hero_title, lang)} subtitle={tr(settings.hero_subtitle, lang)} />
      )}
      {/* Realistic map of all locations */}
      <section className="topo-bg py-20 sm:py-28">
        <Container>
          <SectionHead eyebrow={d.home.mapEyebrow} title={d.home.mapTitle} text={d.home.mapText} />
          <Reveal>
            <RegionMap locations={map.locations} tours={map.tours} locale={lang} />
          </Reveal>
        </Container>
      </section>

      {/* Locations */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHead eyebrow={d.home.locEyebrow} title={d.home.locTitle} action={moreLink("/locations", d.home.locAll)} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {locations.slice(0, 8).map((l, i) => (
              <Reveal key={l.id} delay={(i % 4) * 0.06}>
                <LocationCard location={l} locale={lang} className="h-full" />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Ready tours */}
      <section className="bg-paper-2/60 py-20 sm:py-28">
        <Container>
          <SectionHead eyebrow={d.home.toursEyebrow} title={d.home.toursTitle} text={d.home.toursText} action={moreLink("/tours", d.home.toursAll)} />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {showcase.map((t, i) => (
              <Reveal key={t.id} delay={i * 0.08}>
                <TourCard tour={t} route={routeOf(t, locations)} locale={lang} rates={settings.rates} />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
      {/* What's included — as a map legend */}
      <section className="py-20 sm:py-28">
        <Container>
          <div className="rounded-[2rem] border-2 border-dashed border-ink/15 p-6 sm:p-12">
            <SectionHead eyebrow={d.home.legendEyebrow} title={d.home.legendTitle} className="md:mb-10" />
            <div className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {d.home.legend.map((item, i) => {
                const Icon = LEGEND_ICONS[i];
                return (
                  <Reveal key={item.title} delay={(i % 3) * 0.06} className="flex gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-route bg-white text-route">
                      <Icon className="size-5" />
                    </span>
                    <div>
                      <h3 className="font-display text-base font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">{item.text}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Build your own */}
      <section className="relative overflow-hidden bg-jungle py-20 text-white sm:py-28">
        <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
          <defs>
            <pattern id="topo-lines" width="220" height="220" patternUnits="userSpaceOnUse">
              <circle cx="110" cy="110" r="30" fill="none" stroke="#fff" />
              <circle cx="110" cy="110" r="60" fill="none" stroke="#fff" />
              <circle cx="110" cy="110" r="90" fill="none" stroke="#fff" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#topo-lines)" />
        </svg>
        <Container className="relative">
          <SectionHead light eyebrow={d.home.howEyebrow} title={d.home.howTitle} />
          <ol className="grid gap-6 md:grid-cols-3">
            {d.home.how.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <li className="relative h-full rounded-card bg-white/8 p-6 backdrop-blur">
                  <span className="font-display text-5xl font-bold text-sunset/90">0{i + 1}</span>
                  <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-white/70">{s.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Link href={`/${lang}/build`} className={buttonClass("primary", "lg", "mt-10")}>
            {d.home.howCta} <ArrowRight className="size-4" />
          </Link>
        </Container>
      </section>

      {/* Transport */}
      {vehicles.length > 0 && (
        <section className="py-20 sm:py-28">
          <Container>
            <SectionHead eyebrow={d.home.transportEyebrow} title={d.home.transportTitle} text={d.home.transportText} action={moreLink("/transport", d.home.transportAll)} />
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {vehicles.slice(0, 4).map((v) => (
                <div key={v.id} className="w-[78%] shrink-0 snap-start sm:w-auto">
                  <VehicleCard vehicle={v} locale={lang} rates={settings.rates} compact />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Guestbook */}
      {reviews.length > 0 && (
        <section className="bg-paper-2/60 py-20 sm:py-28">
          <Container>
            <SectionHead eyebrow={d.home.reviewsEyebrow} title={d.home.reviewsTitle} />
            <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
              {reviews.slice(0, 9).map((r, i) => (
                <figure
                  key={r.id}
                  className="mb-5 break-inside-avoid rounded-sm bg-[#fffdf6] p-6 shadow-card"
                  style={{ rotate: `${((i % 3) - 1) * 0.6}deg`, backgroundImage: "repeating-linear-gradient(transparent 0 27px, rgb(19 32 26 / 0.06) 27px 28px)" }}
                >
                  <div className="text-gold">{"★".repeat(Math.max(1, Math.min(5, r.rating)))}</div>
                  <blockquote className="mt-3 leading-7 text-ink">{r.text}</blockquote>
                  <figcaption className="mt-4 text-sm font-semibold text-ink-soft">
                    — {r.name}
                    {r.country && <span className="font-normal">, {r.country}</span>}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Container>
        </section>
      )}
      {/* Practical info */}
      <section className="topo-bg py-20 sm:py-28">
        <Container>
          <SectionHead eyebrow={d.info.eyebrow} title={d.info.title} />
          <InfoGrid locale={lang} />
        </Container>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-28">
        <Container className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow={d.faq.eyebrow} title={d.faq.title} className="md:mb-0" />
          <Faq items={d.faq.items} />
        </Container>
      </section>
    </>
  );
}

import { CalendarDays, Check, MapPin, X } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/site/gallery";
import { InquiryForm } from "@/components/site/inquiry-form";
import { travelLabel } from "@/components/site/location-card";
import { Price } from "@/components/site/price";
import { Container, Eyebrow } from "@/components/site/section";
import { SmartImage } from "@/components/site/smart-image";
import { getDict } from "@/dictionaries";
import { getLocations, getSettings, getTour, getTours, routeOf } from "@/lib/data";
import { hasLocale, tr, trList } from "@/lib/i18n";
import { JsonLd, pageMeta, tripLd } from "@/lib/seo";
import { LOCALES } from "@/lib/types";
import { Sheet } from "@/components/site/sheet";

export async function generateStaticParams() {
  const tours = await getTours();
  return LOCALES.flatMap((lang) => tours.map((t) => ({ lang, slug: t.slug })));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/tours/[slug]">) {
  const { lang, slug } = await params;
  const t = hasLocale(lang) ? await getTour(slug) : null;
  if (!t || !hasLocale(lang)) return {};
  return pageMeta(lang, `/tours/${t.slug}`, tr(t.title, lang), tr(t.short, lang), t.cover);
}

export default async function TourPage({ params }: PageProps<"/[lang]/tours/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const tour = await getTour(slug);
  if (!tour) notFound();
  const d = getDict(lang);
  const [locations, settings] = await Promise.all([getLocations(), getSettings()]);
  const route = routeOf(tour, locations);
  const title = tr(tour.title, lang);
  const included = trList(tour.included, lang);
  const notIncluded = trList(tour.not_included, lang);

  return (
    <>
      <Sheet flatTop>
      <JsonLd data={tripLd(tour, route, lang)} />
      <section className="pt-24 sm:pt-28">
        <Container>
          <nav className="mb-5 text-sm text-ink-soft">
            <Link href={`/${lang}/tours`} className="hover:text-ink">
              {d.nav.tours}
            </Link>{" "}
            / <span className="text-ink">{title}</span>
          </nav>
          <Gallery images={tour.images.length ? tour.images : [tour.cover].filter(Boolean)} alt={title} />
        </Container>
      </section>

      <section className="py-12 sm:py-16">
        <Container className="grid gap-12 lg:grid-cols-[1fr_400px]">
          <div className="min-w-0">
            <Eyebrow>{tour.kind === "ready" ? d.common.ready : d.common.custom}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl leading-tight font-bold tracking-tight sm:text-5xl">{title}</h1>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold shadow-card">
                <CalendarDays className="size-4 text-route" /> {d.common.days(tour.duration_days)}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-1.5 text-sm font-semibold shadow-card">
                <MapPin className="size-4 text-route" /> {d.common.locationsCount(route.length)}
              </span>
            </div>
            <p className="mt-6 text-xl leading-relaxed">{tr(tour.short, lang)}</p>
            {tr(tour.description, lang) && <p className="mt-4 text-[17px] leading-relaxed whitespace-pre-line text-ink-soft">{tr(tour.description, lang)}</p>}

            {/* Route as a trail of stops */}
            {route.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold">{d.tours.route}</h2>
                <ol className="relative mt-6 space-y-4 before:absolute before:top-4 before:bottom-4 before:left-[19px] before:border-l-2 before:border-dashed before:border-route/50">
                  {route.map((l, i) => (
                    <li key={l.id} className="relative flex gap-4">
                      <span className="z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-4 border-paper bg-route font-display text-sm font-bold text-white">{i + 1}</span>
                      <Link href={`/${lang}/locations/${l.slug}`} className="group flex flex-1 gap-4 rounded-2xl bg-white p-3 shadow-card transition hover:shadow-lift">
                        <SmartImage src={l.cover} alt={tr(l.title, lang)} className="aspect-square w-20 shrink-0 rounded-xl sm:w-24" sizes="96px" />
                        <div className="min-w-0 py-1">
                          <h3 className="font-display font-semibold group-hover:text-route">{tr(l.title, lang)}</h3>
                          <p className="mt-1 line-clamp-2 text-sm text-ink-soft">{tr(l.short, lang)}</p>
                          <p className="mt-1 text-xs font-semibold text-ink-soft">{[tr(l.duration, lang), travelLabel(lang, l.travel_min)].filter(Boolean).join(" · ")}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {tour.program.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl font-semibold">{d.tours.program}</h2>
                <div className="mt-6 space-y-3">
                  {tour.program.map((p) => (
                    <details key={p.day} open={tour.program.length === 1} className="group rounded-2xl bg-white p-5 shadow-card">
                      <summary className="flex cursor-pointer list-none items-center gap-4 [&::-webkit-details-marker]:hidden">
                        <span className="rounded-full bg-jungle px-3 py-1 text-xs font-bold text-white">{d.tours.day(p.day)}</span>
                        <span className="font-display font-semibold">{tr(p.title, lang)}</span>
                      </summary>
                      {tr(p.text, lang) && <p className="mt-3 leading-relaxed whitespace-pre-line text-ink-soft">{tr(p.text, lang)}</p>}
                    </details>
                  ))}
                </div>
              </div>
            )}

            {(included.length > 0 || notIncluded.length > 0) && (
              <div className="mt-12 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-jungle/5 p-6">
                  <h3 className="font-display font-semibold">{d.tours.included}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {included.map((x) => (
                      <li key={x} className="flex gap-2.5 text-[15px]">
                        <Check className="mt-0.5 size-4 shrink-0 text-jungle-2" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-route/5 p-6">
                  <h3 className="font-display font-semibold">{d.tours.notIncluded}</h3>
                  <ul className="mt-4 space-y-2.5">
                    {notIncluded.map((x) => (
                      <li key={x} className="flex gap-2.5 text-[15px]">
                        <X className="mt-0.5 size-4 shrink-0 text-route" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          <aside id="book" className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-card bg-white p-6 shadow-lift">
              <p className="text-sm font-semibold text-ink-soft">
                {tour.price_from ? (
                  <span className="font-display text-3xl font-bold text-ink">
                    {d.common.from} <Price usd={tour.price_from} rates={settings.rates} />
                  </span>
                ) : (
                  d.common.onRequest
                )}
              </p>
              {tr(tour.price_note, lang) && <p className="mt-1 text-sm text-ink-soft">{tr(tour.price_note, lang)}</p>}
              <h2 className="mt-5 font-display text-xl font-semibold">{d.tours.book}</h2>
              <p className="mt-1 mb-5 text-sm text-ink-soft">{d.tours.bookText}</p>
              <InquiryForm locale={lang} tourId={tour.id} source={`tour:${tour.slug}`} compact />
            </div>
          </aside>
        </Container>
      </section>
      </Sheet>
    </>
  );
}

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/section";
import { TourCard } from "@/components/site/tour-card";
import { buttonClass } from "@/components/ui/button";
import { getDict } from "@/dictionaries";
import { getLocations, getSettings, getTours, routeOf } from "@/lib/data";
import { hasLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/[lang]/tours">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, "/tours", d.tours.title, d.tours.text);
}

export default async function ToursPage({ params }: PageProps<"/[lang]/tours">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const [tours, locations, settings] = await Promise.all([getTours(), getLocations(), getSettings()]);
  const hasPrices = tours.some((t) => t.price_from);
  return (
    <>
      <PageHero eyebrow={d.nav.tours} title={d.tours.title} text={d.tours.text}>
        {hasPrices && <CurrencySwitch className="mt-6" />}
      </PageHero>
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {tours.map((t) => (
              <TourCard key={t.id} tour={t} route={routeOf(t, locations)} locale={lang} rates={settings.rates} />
            ))}
            <div className="flex flex-col justify-between rounded-card bg-jungle p-7 text-white shadow-card">
              <div>
                <Sparkles className="size-8 text-sunset" />
                <h2 className="mt-5 font-display text-2xl font-semibold">{d.tours.customTitle}</h2>
                <p className="mt-3 leading-relaxed text-white/75">{d.tours.customText}</p>
              </div>
              <Link href={`/${lang}/build`} className={buttonClass("primary", "lg", "mt-8 self-start")}>
                {d.nav.build} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

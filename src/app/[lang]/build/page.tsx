import { notFound } from "next/navigation";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/section";
import { TourBuilder } from "@/components/site/tour-builder";
import { getDict } from "@/dictionaries";
import { getLocations, getSettings, getVehicles } from "@/lib/data";
import { hasLocale, tr } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { Sheet } from "@/components/site/sheet";

export async function generateMetadata({ params }: PageProps<"/[lang]/build">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, "/build", d.build.title, d.build.text);
}

export default async function BuildPage({ params }: PageProps<"/[lang]/build">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const [locations, vehicles, settings] = await Promise.all([getLocations(), getVehicles(), getSettings()]);
  return (
    <>
      <PageHero eyebrow={d.home.howEyebrow} title={d.build.title} text={d.build.text} />
      <Sheet>
      <section className="py-10 sm:py-14">
        <Container>
          <TourBuilder
            locale={lang}
            telegram={settings.telegram}
            locations={locations.map((l) => ({ id: l.id, title: tr(l.title, lang), region: l.region, cover: l.cover, category: l.category, visit_hours: l.visit_hours, travel_min: l.travel_min }))}
            vehicles={vehicles.map((v) => ({ id: v.id, name: tr(v.name, lang), seats: v.seats, vclass: v.vclass, examples: v.examples }))}
          />
        </Container>
      </section>
      </Sheet>
    </>
  );
}

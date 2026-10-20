import { PlaneLanding } from "lucide-react";
import { notFound } from "next/navigation";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { InquiryForm } from "@/components/site/inquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { Container } from "@/components/site/section";
import { VehicleCard } from "@/components/site/vehicle-card";
import { getDict } from "@/dictionaries";
import { getSettings, getVehicles } from "@/lib/data";
import { hasLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";
import { Sheet } from "@/components/site/sheet";

export async function generateMetadata({ params }: PageProps<"/[lang]/transport">) {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const d = getDict(lang);
  return pageMeta(lang, "/transport", d.transport.title, d.transport.text);
}

export default async function TransportPage({ params }: PageProps<"/[lang]/transport">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const d = getDict(lang);
  const [vehicles, settings] = await Promise.all([getVehicles(), getSettings()]);
  const hasPrices = vehicles.some((v) => v.price_day || v.price_hour || v.price_transfer);
  return (
    <>
      <PageHero eyebrow={d.nav.transport} title={d.transport.title} text={d.transport.text}>
        {hasPrices && <CurrencySwitch className="mt-6" />}
      </PageHero>
      <Sheet>
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((v) => (
              <VehicleCard key={v.id} vehicle={v} locale={lang} rates={settings.rates} />
            ))}
          </div>
        </Container>
      </section>
      <section className="pb-20">
        <Container>
          <div className="grid gap-10 overflow-hidden rounded-[2rem] bg-night p-6 text-white sm:p-12 lg:grid-cols-2">
            <div>
              <PlaneLanding className="size-10 text-sunset" />
              <h2 className="mt-5 font-display text-3xl font-semibold sm:text-4xl">{d.transport.klia}</h2>
              <p className="mt-4 max-w-md text-lg leading-relaxed text-white/70">{d.transport.kliaText}</p>
            </div>
            <div className="rounded-card bg-white p-6 text-ink">
              <InquiryForm locale={lang} source="transport:klia" compact />
            </div>
          </div>
        </Container>
      </section>
      </Sheet>
    </>
  );
}

import Link from 'next/link'
import { ArrowRight, Sparkles, MapPin, Globe2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SmartImage } from '@/components/site/smart-image'
import { LocationFilter } from '@/components/site/location-filter'
import { TourCard } from '@/components/site/tour-card'
import { getSettings, getPublishedLocations, getDistinctLocationFacets, getPublishedTours } from '@/lib/data'

export default async function HomePage() {
  const [settings, locations, facets, tours] = await Promise.all([
    getSettings(),
    getPublishedLocations(),
    getDistinctLocationFacets(),
    getPublishedTours(),
  ])

  const featuredTours = tours.slice(0, 2)

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {settings.heroImage ? (
            <SmartImage
              src={settings.heroImage}
              alt=""
              ratioClassName="h-full w-full"
              className="rounded-none"
              priority
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/30 to-primary/5" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        </div>

        <div className="container mx-auto px-4 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium text-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              {settings.tagline}
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {settings.siteName}
              <span className="block text-primary">Путешествия, которые остаются с вами</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Авторские маршруты по самым красивым уголкам планеты. Подберём тур под ваши
              даты, бюджет и мечты — от рисовых террас Бали до закатов Санторини.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/tours">Смотреть туры <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/contacts">Оставить заявку</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* LOCATIONS */}
      <section id="locations" className="container mx-auto px-4 py-16 sm:py-20">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Локации</h2>
            <p className="mt-1 text-muted-foreground">
              Выберите направление — и мы соберём для вас идеальный маршрут.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Globe2 className="h-4 w-4 text-primary" /> {facets.regions.length} регионов
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-4 w-4 text-primary" /> {locations.length} локаций
            </span>
          </div>
        </div>

        <LocationFilter
          locations={locations}
          regions={facets.regions}
          categories={facets.categories}
        />
      </section>

      {/* FEATURED TOURS */}
      {featuredTours.length > 0 && (
        <section className="bg-secondary/40 py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Популярные туры</h2>
                <p className="mt-1 text-muted-foreground">Готовые программы и индивидуальные маршруты.</p>
              </div>
              <Button asChild variant="ghost">
                <Link href="/tours">Все туры <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {featuredTours.map((t) => (
                <TourCard key={t.id} tour={t} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}

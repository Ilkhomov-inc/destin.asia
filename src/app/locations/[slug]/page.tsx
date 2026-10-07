import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CalendarDays, Eye, MapPin, ArrowLeft, ArrowRight } from 'lucide-react'
import { ImageSlider } from '@/components/site/image-slider'
import { TourCard } from '@/components/site/tour-card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getSettings, getLocationBySlug, getToursForLocation } from '@/lib/data'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const loc = await getLocationBySlug(slug)
  if (!loc) return { title: 'Локация не найдена' }
  const settings = await getSettings()
  return {
    title: loc.title,
    description: loc.shortDescription,
    alternates: { canonical: `/locations/${loc.slug}` },
    openGraph: {
      type: 'website',
      siteName: settings.siteName,
      title: loc.title,
      description: loc.shortDescription,
      url: `/locations/${loc.slug}`,
      images: loc.coverImage ? [{ url: loc.coverImage }] : undefined,
    },
  }
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params
  const loc = await getLocationBySlug(slug)
  if (!loc) notFound()
  const tours = await getToursForLocation(loc.id)

  return (
    <article className="container mx-auto px-4 py-10 sm:py-14">
      <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
        <Link href="/#locations"><ArrowLeft className="mr-1 h-4 w-4" /> Все локации</Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:gap-12">
        <div>
          <ImageSlider images={loc.images} alt={loc.title} />
        </div>

        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary"><MapPin className="mr-1 h-3 w-3" /> {loc.region}</Badge>
            <Badge variant="outline">{loc.category}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{loc.title}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{loc.shortDescription}</p>

          <div className="mt-6 space-y-3 rounded-xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-medium">Лучший сезон</p>
                <p className="text-sm text-muted-foreground">{loc.bestSeason}</p>
              </div>
            </div>
          </div>

          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/contacts">Хочу сюда <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12 max-w-3xl">
        <h2 className="text-2xl font-bold tracking-tight">О локации</h2>
        <p className="mt-4 whitespace-pre-line leading-relaxed text-muted-foreground">
          {loc.description}
        </p>
      </div>

      {/* What to see */}
      {loc.whatToSee.length > 0 && (
        <div className="mt-10 max-w-3xl">
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Eye className="h-5 w-5 text-primary" /> Что посмотреть
          </h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {loc.whatToSee.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 text-sm"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Related tours */}
      {tours.length > 0 && (
        <section className="mt-14">
          <h2 className="text-2xl font-bold tracking-tight">Туры, которые включают эту локацию</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
            {tours.map((t) => (
              <TourCard key={t.id} tour={t} />
            ))}
          </div>
        </section>
      )}

      <p className="mt-12 text-sm text-muted-foreground">
        Все вопросы о поездке в «{loc.title}» —{' '}
        <Link href="/contacts" className="font-medium text-primary hover:underline">
          свяжитесь с нами
        </Link>
        , и мы соберём маршрут под вас.
      </p>
    </article>
  )
}

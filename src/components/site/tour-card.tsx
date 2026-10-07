import Link from 'next/link'
import { Clock, Tag, ArrowRight } from 'lucide-react'
import { SmartImage } from './smart-image'
import type { PublicTour } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function TourCard({ tour }: { tour: PublicTour }) {
  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <SmartImage
        src={tour.coverImage || 'https://picsum.photos/seed/placeholder/800/600'}
        alt={tour.title}
        ratioClassName="aspect-[16/10] w-full"
        className="rounded-t-xl"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {tour.type === 'BASIC' ? 'Базовый тур' : 'Индивидуальный'}
          </Badge>
        </div>
        <h3 className="text-lg font-semibold leading-snug">{tour.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {tour.description}
        </p>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {tour.durationDays} {pluralize(tour.durationDays, ['день', 'дня', 'дней'])}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-primary">
            <Tag className="h-4 w-4" />
            {tour.price}
          </span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Подробнее
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

function pluralize(n: number, forms: [string, string, string]) {
  const n10 = n % 10
  const n100 = n % 100
  if (n10 === 1 && n100 !== 11) return forms[0]
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1]
  return forms[2]
}

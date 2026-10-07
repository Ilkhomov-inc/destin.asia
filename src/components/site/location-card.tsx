import Link from 'next/link'
import { MapPin, ArrowRight } from 'lucide-react'
import { SmartImage } from './smart-image'
import type { PublicLocation } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function LocationCard({ location }: { location: PublicLocation }) {
  return (
    <Link
      href={`/locations/${location.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
    >
      <SmartImage
        src={location.coverImage || 'https://picsum.photos/seed/placeholder/800/600'}
        alt={location.title}
        ratioClassName="aspect-[4/3] w-full"
        className="rounded-t-xl"
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            <MapPin className="mr-1 h-3 w-3" /> {location.region}
          </Badge>
          <Badge variant="outline" className="font-normal">{location.category}</Badge>
        </div>
        <h3 className="text-lg font-semibold leading-snug">{location.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
          {location.shortDescription}
        </p>
        <div className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
          Подробнее
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </div>
      </div>
    </Link>
  )
}

import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { TourForm } from '@/components/admin/tour-form'
import { parseArray, parseProgramDays } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTourPage({ params }: PageProps) {
  const { id } = await params
  const [tour, locations] = await Promise.all([
    db.tour.findUnique({
      where: { id },
      include: { images: { orderBy: { order: 'asc' } }, locations: { select: { locationId: true } } },
    }),
    db.location.findMany({ select: { id: true, title: true, region: true }, orderBy: { title: 'asc' } }),
  ])
  if (!tour) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Редактировать тур</h1>
        <p className="text-sm text-muted-foreground">{tour.title}</p>
      </div>
      <TourForm
        mode="edit"
        locations={locations}
        initial={{
          id: tour.id,
          slug: tour.slug,
          title: tour.title,
          type: tour.type as 'BASIC' | 'INDIVIDUAL',
          description: tour.description,
          durationDays: tour.durationDays,
          price: tour.price,
          startDate: tour.startDate,
          included: parseArray(tour.included),
          notIncluded: parseArray(tour.notIncluded),
          programDays: parseProgramDays(tour.programDays),
          status: tour.status as 'PUBLISHED' | 'DRAFT',
          images: tour.images.map((i) => ({ url: i.url, order: i.order })),
          locationIds: tour.locations.map((tl) => tl.locationId),
        }}
      />
    </div>
  )
}

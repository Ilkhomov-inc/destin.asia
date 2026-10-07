import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { LocationForm } from '@/components/admin/location-form'
import { parseArray } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditLocationPage({ params }: PageProps) {
  const { id } = await params
  const loc = await db.location.findUnique({
    where: { id },
    include: { images: { orderBy: { order: 'asc' } } },
  })
  if (!loc) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Редактировать локацию</h1>
        <p className="text-sm text-muted-foreground">{loc.title}</p>
      </div>
      <LocationForm
        mode="edit"
        initial={{
          id: loc.id,
          slug: loc.slug,
          title: loc.title,
          region: loc.region,
          category: loc.category,
          shortDescription: loc.shortDescription,
          description: loc.description,
          bestSeason: loc.bestSeason,
          whatToSee: parseArray(loc.whatToSee),
          status: loc.status as 'PUBLISHED' | 'DRAFT',
          images: loc.images.map((i) => ({ id: i.id, url: i.url, order: i.order })),
        }}
      />
    </div>
  )
}

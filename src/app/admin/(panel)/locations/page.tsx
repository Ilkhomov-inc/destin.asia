import Link from 'next/link'
import { MapPin, Plus, Pencil } from 'lucide-react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeleteButton } from '@/components/admin/delete-button'

export const dynamic = 'force-dynamic'

export default async function AdminLocationsPage() {
  const locations = await db.location.findMany({
    include: { images: { orderBy: { order: 'asc' }, take: 1 } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MapPin className="h-6 w-6 text-primary" /> Локации
          </h1>
          <p className="text-sm text-muted-foreground">Создавайте и редактируйте направления.</p>
        </div>
        <Button asChild>
          <Link href="/admin/locations/new"><Plus className="mr-1 h-4 w-4" /> Новая локация</Link>
        </Button>
      </div>

      {locations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
          Локаций пока нет. Создайте первую.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {locations.map((l) => {
              const cover = l.images[0]?.url
              return (
                <li key={l.id} className="flex items-center gap-4 p-4">
                  <div className="h-16 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {cover && (
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{l.title}</p>
                      <Badge variant={l.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                        {l.status === 'PUBLISHED' ? 'Опубликована' : 'Черновик'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      /{l.slug} · {l.region} · {l.category}
                    </p>
                    {l.shortDescription && (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {l.shortDescription}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/locations/${l.id}/edit`}>
                        <Pencil className="mr-1 h-4 w-4" /> Изменить
                      </Link>
                    </Button>
                    <DeleteButton
                      deleteUrl={`/api/admin/locations/${l.id}`}
                      label="Удалить"
                      title={`Удалить «${l.title}»?`}
                      description="Локация и все её фото-записи будут удалены. Туры, привязанные к ней, отвяжутся."
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

import { db } from '@/lib/db'
import { TourForm } from '@/components/admin/tour-form'

export const metadata = { title: 'Новый тур' }

export const dynamic = 'force-dynamic'

export default async function NewTourPage() {
  const locations = await db.location.findMany({
    select: { id: true, title: true, region: true },
    orderBy: { title: 'asc' },
  })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Новый тур</h1>
        <p className="text-sm text-muted-foreground">Заполните программу, цену и локации.</p>
      </div>
      <TourForm mode="create" locations={locations} />
    </div>
  )
}

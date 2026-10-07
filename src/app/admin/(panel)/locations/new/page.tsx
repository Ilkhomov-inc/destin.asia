import { LocationForm } from '@/components/admin/location-form'

export const metadata = { title: 'Новая локация' }

export default function NewLocationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Новая локация</h1>
        <p className="text-sm text-muted-foreground">Заполните поля и сохраните.</p>
      </div>
      <LocationForm mode="create" />
    </div>
  )
}

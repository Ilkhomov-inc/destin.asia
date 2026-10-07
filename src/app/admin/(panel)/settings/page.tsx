import { db } from '@/lib/db'
import { SettingsForm } from '@/components/admin/settings-form'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Настройки сайта' }

export default async function AdminSettingsPage() {
  let settings = await db.siteSettings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await db.siteSettings.create({
      data: {
        id: 'singleton',
        siteName: 'Вояж',
        tagline: '',
        phone: '', email: '', whatsapp: '', telegram: '', address: '', aboutText: '',
      },
    })
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Настройки сайта</h1>
        <p className="text-sm text-muted-foreground">Контакты, тексты и соцсети. Применяются ко всему сайту.</p>
      </div>
      <SettingsForm
        initial={{
          siteName: settings.siteName,
          tagline: settings.tagline,
          phone: settings.phone,
          email: settings.email,
          whatsapp: settings.whatsapp,
          telegram: settings.telegram,
          address: settings.address,
          instagram: settings.instagram ?? '',
          facebook: settings.facebook ?? '',
          youtube: settings.youtube ?? '',
          aboutText: settings.aboutText,
          heroImage: settings.heroImage ?? '',
        }}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ImageUploader, type AdminImage } from '@/components/admin/image-uploader'
import { toast } from '@/hooks/use-toast'

interface SettingsData {
  siteName: string
  tagline: string
  phone: string
  email: string
  whatsapp: string
  telegram: string
  address: string
  instagram: string
  facebook: string
  youtube: string
  aboutText: string
  heroImage: string
}

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const router = useRouter()
  const [data, setData] = useState<SettingsData>(initial)
  const [saving, setSaving] = useState(false)

  // heroImage managed as a single-image uploader
  const heroImages: AdminImage[] = data.heroImage
    ? [{ url: data.heroImage, order: 0 }]
    : []

  function setHero(next: AdminImage[]) {
    setData((d) => ({ ...d, heroImage: next[0]?.url ?? '' }))
  }

  function up<K extends keyof SettingsData>(key: K, value: SettingsData[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('save failed')
      toast({ title: 'Настройки сохранены' })
      router.refresh()
    } catch {
      toast({ title: 'Ошибка сохранения', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main */}
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="grid gap-2">
          <Label htmlFor="siteName">Название компании</Label>
          <Input id="siteName" value={data.siteName} onChange={(e) => up('siteName', e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tagline">Слоган</Label>
          <Input id="tagline" value={data.tagline} onChange={(e) => up('tagline', e.target.value)} placeholder="Авторские путешествия по миру" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="phone">Телефон</Label>
            <Input id="phone" value={data.phone} onChange={(e) => up('phone', e.target.value)} placeholder="+7 …" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={data.email} onChange={(e) => up('email', e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" value={data.whatsapp} onChange={(e) => up('whatsapp', e.target.value)} placeholder="телефон в международном формате" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input id="telegram" value={data.telegram} onChange={(e) => up('telegram', e.target.value)} placeholder="username (без @)" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="address">Адрес</Label>
          <Input id="address" value={data.address} onChange={(e) => up('address', e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={data.instagram} onChange={(e) => up('instagram', e.target.value)} placeholder="https://…" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" value={data.facebook} onChange={(e) => up('facebook', e.target.value)} placeholder="https://…" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="youtube">YouTube</Label>
            <Input id="youtube" value={data.youtube} onChange={(e) => up('youtube', e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="about">Текст страницы «О нас»</Label>
          <Textarea id="about" value={data.aboutText} onChange={(e) => up('aboutText', e.target.value)} rows={6} placeholder="Расскажите о компании…" />
          <p className="text-xs text-muted-foreground">Сохраняйте абзацы переносом строки.</p>
        </div>
      </div>

      {/* Side */}
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <Label className="font-medium">Главное фото (hero)</Label>
          <p className="mb-3 text-xs text-muted-foreground">Большое фото в шапке главной страницы.</p>
          <ImageUploader value={heroImages} onChange={setHero} />
        </div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving} className="flex-1">
            {saving ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение…</>
            ) : (
              <><Save className="mr-2 h-4 w-4" /> Сохранить</>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

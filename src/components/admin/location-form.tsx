'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ImageUploader, type AdminImage } from '@/components/admin/image-uploader'
import { toast } from '@/hooks/use-toast'
import { slugify } from '@/lib/slug'

interface LocData {
  id?: string
  slug: string
  title: string
  region: string
  category: string
  shortDescription: string
  description: string
  bestSeason: string
  whatToSee: string[]
  status: 'PUBLISHED' | 'DRAFT'
  images: { id?: string; url: string; order: number }[]
}

interface LocationFormProps {
  initial?: LocData
  mode: 'create' | 'edit'
}

export function LocationForm({ initial, mode }: LocationFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [region, setRegion] = useState(initial?.region ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [shortDescription, setShortDescription] = useState(initial?.shortDescription ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [bestSeason, setBestSeason] = useState(initial?.bestSeason ?? '')
  const [whatToSee, setWhatToSee] = useState<string[]>(initial?.whatToSee ?? [])
  const [published, setPublished] = useState(initial?.status !== 'DRAFT')
  const [images, setImages] = useState<AdminImage[]>(
    (initial?.images ?? []).map((i) => ({ url: i.url, order: i.order }))
  )
  const [saving, setSaving] = useState(false)

  function onTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  async function save() {
    if (!title.trim()) {
      toast({ title: 'Укажите название', variant: 'destructive' })
      return
    }
    const finalSlug = slugify(slug || title)
    if (!finalSlug) {
      toast({ title: 'Не удалось сформировать URL', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body = {
        slug: finalSlug,
        title,
        region,
        category,
        shortDescription,
        description,
        bestSeason,
        whatToSee: whatToSee.filter((s) => s.trim()),
        status: published ? 'PUBLISHED' : 'DRAFT',
        images,
      }
      const url = initial?.id
        ? `/api/admin/locations/${initial.id}`
        : '/api/admin/locations'
      const method = initial?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'slug_taken') {
          toast({ title: 'Такой URL уже занят', description: 'Придумайте другой.', variant: 'destructive' })
          setSlugTouched(true)
          return
        }
        throw new Error(err.error || 'save failed')
      }
      toast({ title: mode === 'edit' ? 'Локация обновлена' : 'Локация создана' })
      router.push('/admin/locations')
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Ошибка сохранения', description: e?.message, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="space-y-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-2">
            <Label htmlFor="title">Название *</Label>
            <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Бали" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">URL (slug) *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/locations/</span>
              <Input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} placeholder="bali" />
            </div>
            <p className="text-xs text-muted-foreground">Только латиница и дефисы. Оставьте пустым — сформируется из названия.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="region">Регион</Label>
              <Input id="region" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="Азия" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Категория</Label>
              <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Острова" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="short">Короткое описание</Label>
            <Input id="short" value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} placeholder="Одна строка для карточки" maxLength={200} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Полное описание</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={6} placeholder="Подробный текст о локации" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="season">Лучший сезон</Label>
            <Input id="season" value={bestSeason} onChange={(e) => setBestSeason(e.target.value)} placeholder="Апрель — октябрь" />
          </div>

          <StringListEditor
            label="Что посмотреть"
            items={whatToSee}
            onChange={setWhatToSee}
            placeholder="Напр., Рисовые террасы Тегаллаланг"
          />
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="font-medium">Опубликована</Label>
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Выкл. = черновик (не виден на сайте).
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label className="font-medium">Фотографии</Label>
            <p className="mb-3 text-xs text-muted-foreground">
              Первое фото — обложка. Тяните за иконку, чтобы изменить порядок.
            </p>
            <ImageUploader value={images} onChange={setImages} />
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="flex-1">
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение…</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> {mode === 'edit' ? 'Сохранить' : 'Создать'}</>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/locations')}>
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StringListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder?: string
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => {
                const next = [...items]
                next[i] = e.target.value
                onChange(next)
              }}
              placeholder={placeholder}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              aria-label="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange([...items, ''])}
        >
          <Plus className="mr-1 h-4 w-4" /> Добавить пункт
        </Button>
      </div>
    </div>
  )
}

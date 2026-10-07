'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Save, Loader2, GripVertical, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ImageUploader, type AdminImage } from '@/components/admin/image-uploader'
import { StringListEditor } from '@/components/admin/location-form'
import { toast } from '@/hooks/use-toast'
import { slugify } from '@/lib/slug'

interface ProgramDay {
  day: number
  title: string
  description: string
}

interface TourData {
  id?: string
  slug: string
  title: string
  type: 'BASIC' | 'INDIVIDUAL'
  description: string
  durationDays: number
  price: string
  startDate: string | null
  included: string[]
  notIncluded: string[]
  programDays: ProgramDay[]
  status: 'PUBLISHED' | 'DRAFT'
  images: { url: string; order: number }[]
  locationIds: string[]
}

interface LocationOption {
  id: string
  title: string
  region: string
}

interface TourFormProps {
  initial?: TourData
  mode: 'create' | 'edit'
  locations: LocationOption[]
}

export function TourForm({ initial, mode, locations }: TourFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(mode === 'edit')
  const [type, setType] = useState<'BASIC' | 'INDIVIDUAL'>(initial?.type ?? 'BASIC')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [durationDays, setDurationDays] = useState(initial?.durationDays ?? 7)
  const [price, setPrice] = useState(initial?.price ?? '')
  const [startDate, setStartDate] = useState(initial?.startDate ?? '')
  const [included, setIncluded] = useState<string[]>(initial?.included ?? [])
  const [notIncluded, setNotIncluded] = useState<string[]>(initial?.notIncluded ?? [])
  const [programDays, setProgramDays] = useState<ProgramDay[]>(initial?.programDays ?? [])
  const [published, setPublished] = useState(initial?.status !== 'DRAFT')
  const [images, setImages] = useState<AdminImage[]>(
    (initial?.images ?? []).map((i) => ({ url: i.url, order: i.order }))
  )
  const [locationIds, setLocationIds] = useState<string[]>(initial?.locationIds ?? [])
  const [saving, setSaving] = useState(false)

  function onTitleChange(v: string) {
    setTitle(v)
    if (!slugTouched) setSlug(slugify(v))
  }

  function toggleLocation(id: string) {
    setLocationIds((cur) =>
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
    )
  }

  function addProgramDay() {
    setProgramDays((cur) => [...cur, { day: cur.length + 1, title: '', description: '' }])
  }
  function updateProgramDay(i: number, patch: Partial<ProgramDay>) {
    setProgramDays((cur) => cur.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }
  function removeProgramDay(i: number) {
    setProgramDays((cur) => cur.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, day: idx + 1 })))
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
        type,
        description,
        durationDays: Number(durationDays) || 1,
        price,
        startDate: startDate || null,
        included: included.filter((s) => s.trim()),
        notIncluded: notIncluded.filter((s) => s.trim()),
        programDays: programDays.filter((d) => d.title.trim() || d.description.trim()),
        status: published ? 'PUBLISHED' : 'DRAFT',
        images,
        locationIds,
      }
      const url = initial?.id ? `/api/admin/tours/${initial.id}` : '/api/admin/tours'
      const method = initial?.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (err.error === 'slug_taken') {
          toast({ title: 'Такой URL уже занят', variant: 'destructive' })
          setSlugTouched(true)
          return
        }
        throw new Error(err.error || 'save failed')
      }
      toast({ title: mode === 'edit' ? 'Тур обновлён' : 'Тур создан' })
      router.push('/admin/tours')
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
            <Input id="title" value={title} onChange={(e) => onTitleChange(e.target.value)} placeholder="Бали: 7 дней в раю" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="slug">URL (slug) *</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/tours/</span>
              <Input id="slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true) }} placeholder="bali-7-days" />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Тип тура</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'BASIC' | 'INDIVIDUAL')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASIC">Базовый (готовая программа)</SelectItem>
                  <SelectItem value="INDIVIDUAL">Индивидуальный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="duration">Длительность (дней)</Label>
              <Input id="duration" type="number" min={1} value={durationDays} onChange={(e) => setDurationDays(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="price">Цена</Label>
              <Input id="price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1890 € или от 2500 €" />
            </div>
            {type === 'BASIC' && (
              <div className="grid gap-2">
                <Label htmlFor="startDate">Даты</Label>
                <Input id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="Ежемесячно / 15 мая" />
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="desc">Описание</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Короткое описание тура" />
          </div>

          {/* Program days */}
          <div className="grid gap-2">
            <Label>Программа по дням</Label>
            <div className="space-y-3">
              {programDays.map((d, i) => (
                <div key={i} className="rounded-lg border border-border p-3">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      {d.day}
                    </span>
                    <Input
                      value={d.title}
                      onChange={(e) => updateProgramDay(i, { title: e.target.value })}
                      placeholder={`День ${d.day} — заголовок`}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeProgramDay(i)} aria-label="Удалить день">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Textarea
                    value={d.description}
                    onChange={(e) => updateProgramDay(i, { description: e.target.value })}
                    rows={2}
                    placeholder="Описание дня"
                  />
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={addProgramDay}>
                <Plus className="mr-1 h-4 w-4" /> Добавить день
              </Button>
            </div>
          </div>

          <StringListEditor label="Что включено" items={included} onChange={setIncluded} placeholder="Проживание, завтраки…" />
          <StringListEditor label="Не включено" items={notIncluded} onChange={setNotIncluded} placeholder="Авиаперелёт, страховка…" />
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <Label htmlFor="published" className="font-medium">Опубликован</Label>
              <Switch id="published" checked={published} onCheckedChange={setPublished} />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Выкл. = черновик.</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label className="font-medium">Фотографии</Label>
            <p className="mb-3 text-xs text-muted-foreground">Первое фото — обложка.</p>
            <ImageUploader value={images} onChange={setImages} />
          </div>

          {/* Locations multi-select */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <Label className="font-medium">Локации в туре</Label>
            <p className="mb-3 text-xs text-muted-foreground">Отметьте локации, которые входят в тур.</p>
            {locations.length === 0 ? (
              <p className="text-sm text-muted-foreground">Сначала создайте локации.</p>
            ) : (
              <div className="max-h-64 space-y-1 overflow-y-auto scrollbar-thin pr-1">
                {locations.map((l) => {
                  const checked = locationIds.includes(l.id)
                  return (
                    <label
                      key={l.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleLocation(l.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span>{l.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{l.region}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="flex-1">
              {saving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Сохранение…</>
              ) : (
                <><Save className="mr-2 h-4 w-4" /> {mode === 'edit' ? 'Сохранить' : 'Создать'}</>
              )}
            </Button>
            <Button variant="outline" onClick={() => router.push('/admin/tours')}>
              Отмена
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

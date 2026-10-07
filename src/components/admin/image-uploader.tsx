'use client'

import { useState, useRef } from 'react'
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Upload, Link2, X, GripVertical, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SmartImage } from '@/components/site/smart-image'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface AdminImage {
  url: string
  order: number
}

interface ImageUploaderProps {
  value: AdminImage[]
  onChange: (next: AdminImage[]) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [urlInput, setUrlInput] = useState('')
  const [showUrl, setShowUrl] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    setUploading(true)
    try {
      const next = [...value]
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/admin/upload', { method: 'POST', body: form })
        if (!res.ok) {
          const err = await res.json().catch(() => ({}))
          throw new Error(err.error || 'upload failed')
        }
        const { url } = await res.json()
        next.push({ url, order: next.length })
      }
      onChange(next)
      toast({ title: `Загружено фото: ${files.length}` })
    } catch (e: any) {
      toast({ title: 'Ошибка загрузки', description: e?.message, variant: 'destructive' })
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  function addUrl() {
    const u = urlInput.trim()
    if (!u) return
    onChange([...value, { url: u, order: value.length }])
    setUrlInput('')
    setShowUrl(false)
    toast({ title: 'Ссылка добавлена' })
  }

  function removeAt(i: number) {
    const next = value.filter((_, idx) => idx !== i).map((img, idx) => ({ ...img, order: idx }))
    onChange(next)
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = value.findIndex((_, i) => String(i) === String(active.id))
    const newIndex = value.findIndex((_, i) => String(i) === String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    const next = arrayMove(value, oldIndex, newIndex).map((img, idx) => ({ ...img, order: idx }))
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
        >
          {uploading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Загрузка…</>
          ) : (
            <><Upload className="mr-2 h-4 w-4" /> Загрузить фото</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrl((s) => !s)}
        >
          <Link2 className="mr-2 h-4 w-4" /> Добавить по ссылке
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {showUrl && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://…"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
          />
          <Button type="button" size="sm" onClick={addUrl}>
            <Plus className="mr-1 h-4 w-4" /> Добавить
          </Button>
        </div>
      )}

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Нет фото. Загрузите или добавьте по ссылке. Первое фото будет обложкой.
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={value.map((_, i) => String(i))}
            strategy={horizontalListSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {value.map((img, i) => (
                <SortableImage
                  key={i}
                  id={String(i)}
                  img={img}
                  isCover={i === 0}
                  onRemove={() => removeAt(i)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function SortableImage({
  id,
  img,
  isCover,
  onRemove,
}: {
  id: string
  img: AdminImage
  isCover: boolean
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group relative aspect-square overflow-hidden rounded-lg border border-border bg-card',
        isDragging && 'opacity-60'
      )}
    >
      <SmartImage src={img.url} alt="" ratioClassName="h-full w-full" />
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1 rounded bg-background/80 p-1 text-foreground shadow-sm"
        aria-label="Перетащить для изменения порядка"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded bg-destructive p-1 text-white shadow-sm hover:bg-destructive/90"
        aria-label="Удалить фото"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {isCover && (
        <span className="absolute bottom-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
          Обложка
        </span>
      )}
    </div>
  )
}

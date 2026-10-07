'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SmartImage } from './smart-image'

interface ImageSliderProps {
  images: { id: string; url: string; order: number }[]
  alt: string
  className?: string
  /** large gallery mode adds lightbox + thumbnails */
  gallery?: boolean
}

export function ImageSlider({ images, alt, className, gallery = true }: ImageSliderProps) {
  const sorted = [...images].sort((a, b) => a.order - b.order)
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + sorted.length) % sorted.length)
    },
    [sorted.length]
  )

  useEffect(() => {
    if (!sorted.length) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'Escape') setLightbox(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [go])

  if (!sorted.length) {
    return (
      <div className={cn('aspect-[16/10] w-full rounded-xl bg-muted', className)} />
    )
  }

  const current = sorted[index % sorted.length]

  return (
    <div className={className}>
      {/* Main slide */}
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={() => gallery && setLightbox(true)}
          className="block w-full text-left"
          aria-label="Открыть фото на весь экран"
        >
          <SmartImage
            src={current.url}
            alt={`${alt} — фото ${index + 1}`}
            ratioClassName="aspect-[16/10] w-full rounded-xl"
            priority={index === 0}
          />
        </button>

        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-background"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-2 shadow hover:bg-background"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-xs font-medium">
              {index + 1} / {sorted.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {gallery && sorted.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setIndex(i)}
              className={cn(
                'overflow-hidden rounded-md ring-2 ring-transparent transition',
                i === index && 'ring-primary'
              )}
              aria-label={`Фото ${i + 1}`}
            >
              <SmartImage src={img.url} alt="" ratioClassName="aspect-square w-full" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            onClick={() => setLightbox(false)}
            aria-label="Закрыть"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={current.url}
            alt={alt}
            className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); go(-1) }}
            aria-label="Предыдущее"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
            onClick={(e) => { e.stopPropagation(); go(1) }}
            aria-label="Следующее"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}
    </div>
  )
}

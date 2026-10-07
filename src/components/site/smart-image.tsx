'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SmartImageProps {
  src: string
  alt: string
  className?: string
  /** Aspect ratio wrapper class, e.g. "aspect-[4/3]" */
  ratioClassName?: string
  priority?: boolean
}

/**
 * Lightweight lazy-loaded image with fade-in.
 * Uses a plain <img> so it works with any URL (remote placeholders,
 * locally uploaded files in /uploads, etc.) without next/image domain config.
 */
export function SmartImage({
  src,
  alt,
  className,
  ratioClassName,
  priority = false,
}: SmartImageProps) {
  const [loaded, setLoaded] = useState(false)
  return (
    <div className={cn('relative overflow-hidden bg-muted', ratioClassName, className)}>
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden />
      )}
      <img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'img-fade h-full w-full object-cover',
          loaded && 'is-loaded'
        )}
      />
    </div>
  )
}

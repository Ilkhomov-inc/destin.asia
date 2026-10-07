'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { LocationCard } from './location-card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { PublicLocation } from '@/lib/types'

interface LocationFilterProps {
  locations: PublicLocation[]
  regions: string[]
  categories: string[]
}

const ALL = 'all'

export function LocationFilter({ locations, regions, categories }: LocationFilterProps) {
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState(ALL)
  const [category, setCategory] = useState(ALL)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return locations.filter((l) => {
      if (region !== ALL && l.region !== region) return false
      if (category !== ALL && l.category !== category) return false
      if (q) {
        const hay = `${l.title} ${l.region} ${l.category} ${l.shortDescription}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [locations, query, region, category])

  const hasFilters = query || region !== ALL || category !== ALL

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-8 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск локаций…"
            className="pl-9"
            aria-label="Поиск локаций"
          />
        </div>
        <div className="flex flex-1 gap-3">
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-full" aria-label="Регион">
              <SelectValue placeholder="Регион" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все регионы</SelectItem>
              {regions.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full" aria-label="Категория">
              <SelectValue placeholder="Категория" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Все категории</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button
            variant="ghost"
            onClick={() => { setQuery(''); setRegion(ALL); setCategory(ALL) }}
            className="md:self-end"
          >
            Сбросить
          </Button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">Ничего не найдено. Попробуйте изменить фильтры.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <LocationCard key={l.id} location={l} />
          ))}
        </div>
      )}
    </div>
  )
}

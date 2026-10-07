'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface DeleteButtonProps {
  /** Full URL to DELETE, e.g. `/api/admin/locations/abc`. */
  deleteUrl: string
  label?: string
  title?: string
  description?: string
  /** Reload the current page after a successful delete (default true). */
  reloadOnSuccess?: boolean
}

export function DeleteButton({
  deleteUrl,
  label = 'Удалить',
  title = 'Удалить безвозвратно?',
  description = 'Это действие нельзя отменить.',
  reloadOnSuccess = true,
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function run() {
    setLoading(true)
    try {
      const res = await fetch(deleteUrl, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      setOpen(false)
      toast({ title: 'Удалено' })
      if (reloadOnSuccess) window.location.reload()
    } catch (e: any) {
      toast({ title: 'Ошибка удаления', description: e?.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center rounded-md border border-destructive/40 bg-background px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive/5"
        >
          {label}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Отмена</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => { e.preventDefault(); run() }}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Удаляем…</> : 'Удалить'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

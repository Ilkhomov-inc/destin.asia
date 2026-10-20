"use client";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const go = useCallback((dir: number) => setOpen((i) => (i === null ? i : (i + dir + images.length) % images.length)), [images.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (!images.length) return null;
  const main = images.slice(0, 5);

  return (
    <>
      <div className={cn("grid gap-2 overflow-hidden rounded-[1.5rem]", main.length > 1 ? "grid-cols-4 grid-rows-2" : "grid-cols-1")} style={{ height: "clamp(280px, 52vw, 560px)" }}>
        {main.map((src, i) => (
          <button
            key={src}
            type="button"
            onClick={() => setOpen(i)}
            className={cn("group relative overflow-hidden bg-paper-2", i === 0 ? "col-span-4 row-span-2 sm:col-span-2" : "hidden sm:block", main.length === 2 && i === 1 && "sm:col-span-2 sm:row-span-2", main.length === 3 && i > 0 && "sm:col-span-2")}
          >
            <Image src={src} alt={`${alt} ${i + 1}`} fill preload={i === 0} sizes={i === 0 ? "(min-width: 640px) 50vw, 100vw" : "25vw"} className="object-cover transition duration-700 group-hover:scale-105" />
            {i === main.length - 1 && images.length > main.length && (
              <span className="absolute inset-0 flex items-center justify-center bg-night/50 font-display text-2xl font-semibold text-white">+{images.length - main.length}</span>
            )}
          </button>
        ))}
      </div>
      {images.length > 1 && (
        <button type="button" onClick={() => setOpen(0)} className="mt-3 text-sm font-semibold text-ink-soft underline-offset-4 hover:underline sm:hidden">
          1 / {images.length} →
        </button>
      )}
      <AnimatePresence>
        {open !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] flex items-center justify-center bg-night/95" onClick={() => setOpen(null)}>
            <div className="relative h-[80svh] w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <Image key={images[open]} src={images[open]} alt={alt} fill sizes="100vw" className="object-contain" />
            </div>
            <button type="button" aria-label="Close" onClick={() => setOpen(null)} className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
              <X className="size-5" />
            </button>
            {images.length > 1 && (
              <>
                <button type="button" aria-label="Prev" onClick={(e) => (e.stopPropagation(), go(-1))} className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
                  <ChevronLeft className="size-5" />
                </button>
                <button type="button" aria-label="Next" onClick={(e) => (e.stopPropagation(), go(1))} className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white">
                  <ChevronRight className="size-5" />
                </button>
                <span className="absolute bottom-5 text-sm font-semibold text-white/70">
                  {open + 1} / {images.length}
                </span>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

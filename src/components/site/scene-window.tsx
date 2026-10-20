import { cn } from "@/lib/utils";

/** A transparent gap that reveals the fixed ambient Kuala Lumpur scene behind the page. */
export function SceneWindow({ caption, className, tall }: { caption?: string; className?: string; tall?: boolean }) {
  return (
    <div data-scene-window className={cn("relative h-[42svh] min-h-64", tall ? "sm:h-[62vh]" : "sm:h-[54vh]", className)}>
      {caption && (
        <p className="absolute bottom-6 left-1/2 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-paper/80 px-4 py-2 text-center text-sm font-semibold text-ink shadow-card backdrop-blur-md">
          {caption}
        </p>
      )}
    </div>
  );
}

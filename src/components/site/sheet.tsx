import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Opaque paper "sheet" that page content sits on, so text stays readable over the ambient
 * background. `overflow-clip` (not hidden) keeps sticky sidebars inside working.
 */
export function Sheet({ children, className, flatTop }: { children: ReactNode; className?: string; flatTop?: boolean }) {
  return (
    <div
      className={cn(
        "relative overflow-clip bg-paper shadow-[0_0_60px_-24px_rgb(11_21_48/0.45)]",
        "rounded-b-[1.75rem] sm:rounded-b-[2.5rem]",
        !flatTop && "rounded-t-[1.75rem] sm:rounded-t-[2.5rem]",
        className,
      )}
    >
      {children}
    </div>
  );
}

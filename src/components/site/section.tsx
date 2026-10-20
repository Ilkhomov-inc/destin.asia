import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Eyebrow({ children, className, light }: { children: ReactNode; className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em]", light ? "text-sunset" : "text-route", className)}>
      <span className={cn("h-px w-6", light ? "bg-sunset" : "bg-route")} />
      {children}
    </span>
  );
}

export function SectionHead({
  eyebrow,
  title,
  text,
  action,
  light,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 flex flex-col gap-6 md:mb-14 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <Eyebrow light={light}>{eyebrow}</Eyebrow>
        <h2 className={cn("mt-4 font-display text-3xl leading-[1.1] font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl", light ? "text-white" : "text-ink")}>
          {title}
        </h2>
        {text && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-white/70" : "text-ink-soft")}>{text}</p>}
      </div>
      {action}
    </div>
  );
}

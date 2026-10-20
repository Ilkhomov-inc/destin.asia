import type { ReactNode } from "react";
import { Container, Eyebrow } from "./section";

/** Inner-page header: a window onto the ambient city with the title on a frosted card. */
export function PageHero({ eyebrow, title, text, children }: { eyebrow?: ReactNode; title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section data-scene-window className="relative flex min-h-[54svh] items-end pt-28 pb-8 sm:min-h-[60vh] sm:pb-12">
      <Container>
        <div className="max-w-3xl rounded-[1.75rem] bg-paper/85 p-6 shadow-lift backdrop-blur-md sm:p-10">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-4 font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
          {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{text}</p>}
          {children}
        </div>
      </Container>
    </section>
  );
}

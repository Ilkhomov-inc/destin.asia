import type { ReactNode } from "react";
import { Container, Eyebrow } from "./section";

export function PageHero({ eyebrow, title, text, children }: { eyebrow?: ReactNode; title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="topo-bg border-b border-line pt-28 pb-12 sm:pt-36 sm:pb-16">
      <Container>
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.05] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">{title}</h1>
        {text && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft">{text}</p>}
        {children}
      </Container>
    </section>
  );
}

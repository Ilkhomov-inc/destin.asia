import Link from "next/link";
import { buttonClass } from "@/components/ui/button";
import ru from "@/dictionaries/ru";

export default function NotFound() {
  return (
    <section className="topo-bg flex min-h-[70svh] flex-col items-center justify-center px-4 pt-24 text-center">
      <p className="font-display text-7xl font-bold text-route">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">{ru.notFound.title}</h1>
      <p className="mt-2 text-ink-soft">{ru.notFound.text}</p>
      <Link href="/" className={buttonClass("dark", "md", "mt-8")}>
        {ru.notFound.home}
      </Link>
    </section>
  );
}

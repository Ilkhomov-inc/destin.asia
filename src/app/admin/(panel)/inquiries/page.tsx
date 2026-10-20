import Link from "next/link";
import { InquiryCard } from "@/components/admin/inquiry-card";
import { inquiryDetails } from "@/lib/admin-data";
import { store } from "@/lib/store";
import { INQUIRY_STATUSES } from "@/lib/types";
import { cn } from "@/lib/utils";

const LABELS = { all: "Все", new: "Новые", in_progress: "В работе", done: "Готово", spam: "Спам" } as const;

export default async function InquiriesPage({ searchParams }: PageProps<"/admin/inquiries">) {
  const { status } = await searchParams;
  const [inquiries, locations, tours, vehicles] = await Promise.all([store.all("inquiries"), store.all("locations"), store.all("tours"), store.all("vehicles")]);
  const filter = typeof status === "string" && (INQUIRY_STATUSES as readonly string[]).includes(status) ? status : "all";
  const shown = inquiries.filter((i) => filter === "all" || i.status === filter).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const details = inquiryDetails(locations, tours, vehicles);
  return (
    <div className="py-8">
      <h1 className="font-display text-2xl font-semibold">Заявки</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", ...INQUIRY_STATUSES] as const).map((s) => (
          <Link key={s} href={s === "all" ? "/admin/inquiries" : `/admin/inquiries?status=${s}`} className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", filter === s ? "border-ink bg-ink text-white" : "border-ink/12 bg-white")}>
            {LABELS[s]} <span className="opacity-60">{s === "all" ? inquiries.length : inquiries.filter((i) => i.status === s).length}</span>
          </Link>
        ))}
      </div>
      <div className="mt-6 space-y-3">{shown.length ? shown.map((i) => <InquiryCard key={i.id} inquiry={i} details={details(i)} />) : <p className="text-ink-soft">Пусто.</p>}</div>
    </div>
  );
}

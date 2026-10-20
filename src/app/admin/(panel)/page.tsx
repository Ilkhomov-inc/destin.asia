import Link from "next/link";
import { InquiryCard } from "@/components/admin/inquiry-card";
import { inquiryDetails } from "@/lib/admin-data";
import { store, usingSupabase } from "@/lib/store";

export default async function Dashboard() {
  const [inquiries, locations, tours, vehicles] = await Promise.all([store.all("inquiries"), store.all("locations"), store.all("tours"), store.all("vehicles")]);
  const fresh = inquiries.filter((i) => i.status === "new").sort((a, b) => b.created_at.localeCompare(a.created_at));
  const stats = [
    ["Новые заявки", fresh.length, "/admin/inquiries"],
    ["Всего заявок", inquiries.length, "/admin/inquiries"],
    ["Локации", locations.length, "/admin/locations"],
    ["Туры", tours.length, "/admin/tours"],
    ["Машины", vehicles.length, "/admin/vehicles"],
  ] as const;
  const details = inquiryDetails(locations, tours, vehicles);
  return (
    <div className="py-8">
      <h1 className="font-display text-2xl font-semibold">Обзор</h1>
      {!usingSupabase && (
        <p className="mt-4 rounded-xl bg-gold/20 p-4 text-sm">
          Сейчас данные хранятся в локальном файле <code>.data/db.json</code>. Для продакшена подключите Supabase — инструкция в README.
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {stats.map(([label, n, href]) => (
          <Link key={label} href={href} className="rounded-2xl border border-ink/8 bg-white p-5 transition hover:border-ink/20">
            <div className="font-display text-3xl font-bold">{n}</div>
            <div className="mt-1 text-sm text-ink-soft">{label}</div>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 mb-4 font-display text-lg font-semibold">Новые заявки</h2>
      <div className="space-y-3">
        {fresh.length ? fresh.slice(0, 10).map((i) => <InquiryCard key={i.id} inquiry={i} details={details(i)} />) : <p className="text-ink-soft">Новых заявок нет.</p>}
      </div>
    </div>
  );
}

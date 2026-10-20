import { ListHeader, ListRow } from "@/components/admin/list";
import { store } from "@/lib/store";

export default async function AdminTours() {
  const rows = (await store.all("tours")).sort((a, b) => a.sort - b.sort);
  return (
    <>
      <ListHeader title="Туры" newHref="/admin/tours/new" />
      <div className="space-y-2">
        {rows.map((t) => (
          <ListRow key={t.id} href={`/admin/tours/${t.id}`} image={t.cover} title={t.title.ru} sub={`${t.duration_days} дн. · ${t.location_ids.length} локац.${t.featured ? " · на главной" : ""}`} draft={t.status === "draft"} />
        ))}
      </div>
    </>
  );
}

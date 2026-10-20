import { ListHeader, ListRow } from "@/components/admin/list";
import ru from "@/dictionaries/ru";
import { store } from "@/lib/store";

export default async function AdminLocations() {
  const rows = (await store.all("locations")).sort((a, b) => a.sort - b.sort);
  return (
    <>
      <ListHeader title="Локации" newHref="/admin/locations/new" />
      <div className="space-y-2">
        {rows.map((l) => (
          <ListRow key={l.id} href={`/admin/locations/${l.id}`} image={l.cover} title={l.title.ru} sub={`${ru.categories[l.category]} · ${l.region}${l.title.uz ? "" : " · нет перевода UZ"}`} draft={l.status === "draft"} />
        ))}
      </div>
    </>
  );
}

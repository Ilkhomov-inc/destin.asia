import { ListHeader, ListRow } from "@/components/admin/list";
import { store } from "@/lib/store";

export default async function AdminVehicles() {
  const rows = (await store.all("vehicles")).sort((a, b) => a.sort - b.sort);
  return (
    <>
      <ListHeader title="Машины" newHref="/admin/vehicles/new" />
      <div className="space-y-2">
        {rows.map((v) => (
          <ListRow key={v.id} href={`/admin/vehicles/${v.id}`} image={v.image} title={v.name.ru} sub={`${v.examples} · ${v.seats} мест`} draft={v.status === "draft"} />
        ))}
      </div>
    </>
  );
}

import { notFound } from "next/navigation";
import { VehicleEditor } from "@/components/admin/vehicle-editor";
import { blankVehicle } from "@/lib/blank";
import { store } from "@/lib/store";
import { isUuid } from "@/lib/utils";

export default async function EditVehicle({ params }: PageProps<"/admin/vehicles/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  // Postgres rejects a non-UUID id with an error, so treat it as "not found" up front.
  if (!isNew && !isUuid(id)) notFound();
  const row = isNew ? blankVehicle((await store.all("vehicles")).length + 1) : await store.get("vehicles", id);
  if (!row) notFound();
  return <VehicleEditor key={row.id} initial={row} isNew={isNew} />;
}

import { notFound } from "next/navigation";
import { LocationEditor } from "@/components/admin/location-editor";
import { blankLocation } from "@/lib/blank";
import { store } from "@/lib/store";
import { isUuid } from "@/lib/utils";

export default async function EditLocation({ params }: PageProps<"/admin/locations/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  // Postgres rejects a non-UUID id with an error, so treat it as "not found" up front.
  if (!isNew && !isUuid(id)) notFound();
  const row = isNew ? blankLocation((await store.all("locations")).length + 1) : await store.get("locations", id);
  if (!row) notFound();
  return <LocationEditor key={row.id} initial={row} isNew={isNew} />;
}

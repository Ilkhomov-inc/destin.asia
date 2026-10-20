import { notFound } from "next/navigation";
import { LocationEditor } from "@/components/admin/location-editor";
import { blankLocation } from "@/lib/blank";
import { store } from "@/lib/store";

export default async function EditLocation({ params }: PageProps<"/admin/locations/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const row = isNew ? blankLocation((await store.all("locations")).length + 1) : await store.get("locations", id);
  if (!row) notFound();
  return <LocationEditor key={row.id} initial={row} isNew={isNew} />;
}

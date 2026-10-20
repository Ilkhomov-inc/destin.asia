import { notFound } from "next/navigation";
import { TourEditor } from "@/components/admin/tour-editor";
import { blankTour } from "@/lib/blank";
import { store } from "@/lib/store";

export default async function EditTour({ params }: PageProps<"/admin/tours/[id]">) {
  const { id } = await params;
  const isNew = id === "new";
  const [row, locations] = await Promise.all([isNew ? store.all("tours").then((t) => blankTour(t.length + 1)) : store.get("tours", id), store.all("locations")]);
  if (!row) notFound();
  return <TourEditor key={row.id} initial={row} isNew={isNew} locations={locations.sort((a, b) => a.sort - b.sort).map((l) => ({ id: l.id, title: l.title.ru }))} />;
}

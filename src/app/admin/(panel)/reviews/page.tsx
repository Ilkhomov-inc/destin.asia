import { ListHeader } from "@/components/admin/list";
import { ReviewsManager } from "@/components/admin/reviews-manager";
import { store } from "@/lib/store";

export default async function AdminReviews() {
  const [reviews, tours] = await Promise.all([store.all("reviews"), store.all("tours")]);
  return (
    <>
      <ListHeader title="Отзывы" />
      <ReviewsManager reviews={reviews.sort((a, b) => b.created_at.localeCompare(a.created_at))} tours={tours.map((t) => ({ id: t.id, title: t.title.ru }))} />
    </>
  );
}

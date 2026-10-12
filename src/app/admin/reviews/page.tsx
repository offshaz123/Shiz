import { AdminShell } from "@/components/AdminShell";
import { ReviewManager } from "@/components/ReviewManager";
import { fmtDateTime, requireAdmin } from "@/lib/admin";
import { listAllReviews } from "@/lib/reviews";

export const metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  await requireAdmin();
  const reviews = await listAllReviews();
  return (
    <AdminShell active="reviews">
      <ReviewManager
        reviews={reviews.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          rating: r.rating,
          body: r.body,
          verified: Boolean(r.verified),
          status: r.status,
          date: fmtDateTime(r.created_at),
        }))}
      />
    </AdminShell>
  );
}

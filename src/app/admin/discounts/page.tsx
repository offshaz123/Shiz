import { AdminShell } from "@/components/AdminShell";
import { DiscountManager } from "@/components/DiscountManager";
import { requireAdmin } from "@/lib/admin";
import { describeDiscount, listDiscounts } from "@/lib/discounts";
import { money } from "@/lib/plates";

export const metadata = { title: "Discount codes" };

export default async function DiscountsPage() {
  await requireAdmin();
  const codes = await listDiscounts();
  return (
    <AdminShell active="discounts">
      <DiscountManager
        codes={codes.map((d) => ({
          id: d.id,
          code: d.code,
          title: d.title,
          offer: describeDiscount(d),
          rules: [
            d.first_order_only ? "First order only" : "",
            d.min_spend ? `Min. spend ${money(d.min_spend)}` : "",
            d.expires_at ? `Ends ${new Date(d.expires_at).toLocaleDateString("en-GB", { timeZone: "Europe/London" })}` : "",
          ].filter(Boolean),
          uses: d.max_uses ? `${d.uses} / ${d.max_uses}` : String(d.uses),
          active: Boolean(d.active),
          expired: Boolean(d.expires_at && new Date(d.expires_at) < new Date()),
        }))}
      />
    </AdminShell>
  );
}

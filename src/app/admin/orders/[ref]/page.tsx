import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, fmtDateTime } from "@/lib/admin";
import { AdminShell } from "@/components/AdminShell";
import { StatusBadge } from "@/components/StatusBadge";
import { AdminOrderActions } from "@/components/AdminOrderActions";
import { PlatePreview } from "@/components/PlatePreview";
import { docsLabels, getOrder, listDocuments } from "@/lib/orders";
import { describe, money, unitPrice } from "@/lib/plates";
import { cardLine } from "@/lib/emails";

export const metadata: Metadata = { title: "Order", robots: { index: false } };

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-3 font-display text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}

export default async function AdminOrderPage(props: PageProps<"/admin/orders/[ref]">) {
  await requireAdmin();
  const { ref } = await props.params;
  const order = await getOrder(ref);
  if (!order) notFound();
  const docs = await listDocuments(order.id);
  const waText = encodeURIComponent(`Hi ${order.customer_name.split(" ")[0]}, it's PlatedUp about your order ${order.ref}.`);
  const waPhone = order.phone.replace(/\D/g, "").replace(/^0/, "44");

  return (
    <AdminShell active="orders">
      <Link href="/admin" className="text-sm font-semibold hover:text-gold">
        ← All orders
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h2 className="font-display text-3xl font-bold">Order {order.ref}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-sm text-muted">Placed {fmtDateTime(order.created_at)}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card title="Plates">
            <ul className="divide-y divide-line">
              {order.items.map((i, idx) => (
                <li key={idx} className="grid gap-4 py-4 first:pt-0 sm:grid-cols-[240px_1fr_auto] sm:items-center">
                  <div className="space-y-2">
                    {i.which !== "rear" && <PlatePreview config={i} side="front" className="w-full rounded border border-line" />}
                    {i.which !== "front" && <PlatePreview config={i} side="rear" className="w-full" />}
                  </div>
                  <div>
                    <p className="whitespace-pre font-mono text-lg font-bold">
                      {i.reg}
                      {i.qty > 1 && ` × ${i.qty}`}
                    </p>
                    <p className="text-sm text-muted">{describe(i)}</p>
                  </div>
                  <p className="font-semibold">{money(unitPrice(i) * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Delivery: {order.delivery_name}</dt>
                <dd>{order.delivery_price ? money(order.delivery_price) : "FREE"}</dd>
              </div>
              <div className="flex justify-between text-base font-bold">
                <dt>Total</dt>
                <dd>{money(order.total)}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Update order">
            <AdminOrderActions orderRef={order.ref} status={order.status} amountPaid={order.amount_paid} canRefund={Boolean(order.stripe_session_id)} />
          </Card>
        </div>

        <div className="space-y-5">
          <Card title="Payment">
            {order.paid_at ? (
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Paid</dt>
                  <dd className="font-bold text-[#1f7a3d]">{money(order.amount_paid ?? order.total)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted">When</dt>
                  <dd>{fmtDateTime(order.paid_at)}</dd>
                </div>
                {cardLine(order) && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Card</dt>
                    <dd>{cardLine(order)}</dd>
                  </div>
                )}
                {order.stripe_session_id && (
                  <p className="pt-2 text-xs text-muted">Find it in Stripe → Transactions by searching {order.ref}.</p>
                )}
              </dl>
            ) : (
              <p className="text-sm font-semibold text-[#8a4a12]">
                {order.status === "pending"
                  ? "Customer was sent to Stripe but hasn't paid yet."
                  : order.status === "expired"
                    ? "Customer left the payment page without paying."
                    : "Not paid online. Send the customer a payment link."}
              </p>
            )}
          </Card>

          <Card title="Customer">
            <p className="font-semibold">{order.customer_name}</p>
            <p className="text-sm">
              <a href={`mailto:${order.email}`} className="text-gold underline">
                {order.email}
              </a>
            </p>
            <p className="text-sm">{order.phone}</p>
            <p className="mt-2 text-sm text-muted">
              {order.address1}
              {order.address2 && `, ${order.address2}`}
              <br />
              {order.town} {order.postcode}
            </p>
            <p className="mt-2 text-xs text-muted">{order.user_id ? "Has an account" : "Guest checkout"}</p>
            <a
              href={`https://wa.me/${waPhone}?text=${waText}`}
              className="mt-3 inline-block rounded-lg bg-[#25D366] px-4 py-2 text-sm font-semibold text-white"
            >
              WhatsApp customer
            </a>
          </Card>

          <Card title={`Documents: ${docsLabels[order.docs_status]}`}>
            {docs.length === 0 ? (
              <p className={`text-sm ${order.docs_status === "outstanding" ? "font-semibold text-[#b42318]" : "text-muted"}`}>
                {order.docs_status === "not_needed"
                  ? "Show plates only, so no documents needed."
                  : "No documents yet. Don't make road-legal plates until the customer uploads them."}
              </p>
            ) : (
              <ul className="space-y-2">
                {docs.map((d) => (
                  <li key={d.id}>
                    <a href={`/api/admin/documents/${d.id}`} target="_blank" className="text-sm font-semibold text-gold underline">
                      {d.kind === "entitlement" ? "Proof of entitlement (V5C etc.)" : d.kind === "identity" ? "Photo ID" : d.filename}
                    </a>
                    <span className="block text-xs text-muted">
                      {d.filename} · {fmtDateTime(d.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}

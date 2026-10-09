import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { listOrdersForUser } from "@/lib/orders";
import { describe, money, unitPrice } from "@/lib/plates";
import { whatsappHref } from "@/lib/site";
import { PlatePreview } from "@/components/PlatePreview";
import { StatusBadge } from "@/components/StatusBadge";
import { AccountDetailsForm } from "@/components/AccountDetailsForm";
import { LogoutButton } from "@/components/LogoutButton";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

function fmt(d: Date) {
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London" });
}

export default async function AccountPage(props: PageProps<"/account">) {
  if (await isAdmin()) redirect("/admin");
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");
  const { tab } = await props.searchParams;
  const showDetails = tab === "details";
  const orders = showDetails ? [] : await listOrdersForUser(user.id);

  const tabClass = (on: boolean) =>
    `rounded-lg px-4 py-2.5 font-semibold transition-colors ${on ? "gold-bg shadow-sm" : "bg-surface-2/70 text-muted hover:bg-surface-2"}`;

  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">My Account</p>
            <h1 className="mt-1 font-display text-4xl font-bold">Hi, {user.name.split(" ")[0]}</h1>
          </div>
          <LogoutButton />
        </div>

        <nav className="mt-6 flex gap-2" aria-label="Account">
          <Link href="/account" className={tabClass(!showDetails)} aria-current={!showDetails ? "page" : undefined}>
            My Orders
          </Link>
          <Link href="/account?tab=details" className={tabClass(showDetails)} aria-current={showDetails ? "page" : undefined}>
            Account Details
          </Link>
        </nav>

        <div className="mt-6">
          {showDetails ? (
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-7">
              <AccountDetailsForm user={user} />
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <p className="font-display text-2xl font-bold">No orders yet</p>
              <p className="mt-2 text-muted">When you place an order while logged in, it&apos;ll show up here.</p>
              <Link href="/design" className="btn btn-gold mt-6 rounded-lg">
                Design Your Plate
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {orders.map((o) => (
                <li key={o.ref} className="rounded-2xl border border-line bg-white p-5 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                    <div>
                      <p className="font-display text-xl font-bold">Order {o.ref}</p>
                      <p className="text-sm text-muted">Placed {fmt(o.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={o.status} customer />
                      <span className="font-display text-2xl font-bold">{money(o.amount_paid ?? o.total)}</span>
                    </div>
                  </div>
                  <ul className="divide-y divide-line">
                    {o.items.map((i, idx) => (
                      <li key={idx} className="grid gap-4 py-4 sm:grid-cols-[200px_1fr_auto] sm:items-center">
                        <PlatePreview config={i} side={i.which === "front" ? "front" : "rear"} className="w-full" />
                        <div>
                          <p className="whitespace-pre font-semibold">
                            {i.reg}
                            {i.qty > 1 && ` × ${i.qty}`}
                          </p>
                          <p className="text-sm text-muted">{describe(i)}</p>
                        </div>
                        <p className="font-semibold">{money(unitPrice(i) * i.qty)}</p>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
                    <span className="text-muted">
                      {o.delivery_name} · {o.address1}, {o.town} {o.postcode}
                    </span>
                    {o.docs_status === "outstanding" ? (
                      <Link href={`/upload-documents?ref=${o.ref}`} className="font-semibold text-gold underline">
                        Upload your documents
                      </Link>
                    ) : (
                      <a href={whatsappHref} className="font-semibold text-gold underline">
                        Need help? WhatsApp us
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

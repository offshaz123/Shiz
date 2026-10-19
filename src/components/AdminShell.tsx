import Link from "next/link";
import { Suspense } from "react";
import { StatusBar } from "./StatusBar";
import { LogoutButton } from "./LogoutButton";

export function AdminShell({ active, children }: { active: "orders" | "customers" | "discounts" | "reviews" | "money" | "insights" | "prices" | "costs" | "notifications"; children: React.ReactNode }) {
  const tab = (on: boolean) =>
    `rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${on ? "gold-bg shadow-sm" : "bg-white text-ink hover:bg-surface-2"}`;
  return (
    <div className="min-h-[70vh] bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Admin portal</p>
            <h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">PlatedUp Dashboard</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/admin" className={tab(active === "orders")}>
              Orders
            </Link>
            <Link href="/admin/customers" className={tab(active === "customers")}>
              Customers
            </Link>
            <Link href="/admin/discounts" className={tab(active === "discounts")}>
              Discount codes
            </Link>
            <Link href="/admin/reviews" className={tab(active === "reviews")}>
              Reviews
            </Link>
            <Link href="/admin/money" className={tab(active === "money")}>
              Money
            </Link>
            <Link href="/admin/insights" className={tab(active === "insights")}>
              Insights
            </Link>
            <Link href="/admin/prices" className={tab(active === "prices")}>
              Prices
            </Link>
            <Link href="/admin/costs" className={tab(active === "costs")}>
              Costs
            </Link>
            <Link href="/admin/notifications" className={tab(active === "notifications")}>
              Notifications
            </Link>
            <LogoutButton className="rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold hover:bg-surface-2" />
          </div>
        </div>
        <div className="mt-6">
          <Suspense fallback={null}>
            <StatusBar />
          </Suspense>
          {children}
        </div>
      </div>
    </div>
  );
}

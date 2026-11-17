import { brand, currencyFlags } from "@/lib/brand";
import { Flag } from "@/components/Flag";
import { Icon } from "@/components/Icon";

/**
 * A preview of what a customer logs into.
 *
 * Everything here is illustrative and the caption under it says so. The
 * account identifiers are deliberately masked rather than made up: a
 * well-formed sort code and IBAN on a marketing page is the kind of detail
 * somebody screenshots and treats as real.
 */
const nav = [
  { label: "Dashboard", icon: "chart" },
  { label: "Payments", icon: "pay" },
  { label: "Beneficiaries", icon: "team" },
  { label: "Foreign exchange", icon: "convert" },
  { label: "Transactions", icon: "document" },
];

const balances = [
  { code: "GBP", amount: "£15,658.34", active: true },
  { code: "USD", amount: "$18,655.11", active: false },
  { code: "EUR", amount: "€2,586.03", active: false },
];

const payments = [
  { ref: "Northwind Supplies Ltd", date: "12 Sep", code: "USD", amount: "$3,240.50", status: "Completed" },
  { ref: "Ferro Trade Ltd", date: "11 Sep", code: "GBP", amount: "£1,120.00", status: "Completed" },
  { ref: "Lindgren & Co", date: "11 Sep", code: "EUR", amount: "€880.00", status: "In progress" },
  { ref: "Payroll — September", date: "10 Sep", code: "PLN", amount: "zł 42,600.00", status: "Approved" },
];

const statusStyles: Record<string, string> = {
  Completed: "bg-accent-soft text-accent-2",
  Approved: "icon-tile-4",
  "In progress": "bg-surface-2 text-muted",
};

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-lift)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted/25" />
      </div>

      <div className="grid md:grid-cols-[190px_1fr] lg:grid-cols-[200px_1fr_250px]">
        {/* Sidebar */}
        <div className="hidden flex-col gap-1 border-r border-border bg-ink p-4 text-on-ink md:flex">
          <span className="font-display mb-5 text-base font-semibold">
            {brand.shortName}
            <span className="text-accent">.</span>
          </span>
          {nav.map((item, index) => (
            <span
              key={item.label}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs ${
                index === 0 ? "bg-accent font-semibold text-on-accent" : "text-on-ink/60"
              }`}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              {item.label}
            </span>
          ))}
        </div>

        {/* Main panel */}
        <div className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-display text-lg font-semibold">Welcome back</p>
              <p className="mt-1 text-xs text-muted">Here is your account overview.</p>
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-2">
              YC
            </span>
          </div>

          <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
            Quick actions
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-3">
            {[
              { label: "Send money", icon: "pay" },
              { label: "Exchange", icon: "convert" },
            ].map((action) => (
              <div
                key={action.label}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-4 py-4"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent-2">
                  <Icon name={action.icon} className="h-4 w-4" />
                </span>
                <span className="text-xs font-semibold">{action.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {balances.map((balance) => (
              <div
                key={balance.code}
                className={`rounded-xl border px-3.5 py-3 ${
                  balance.active ? "border-accent bg-accent-soft" : "border-border bg-card"
                }`}
              >
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                  <Flag code={currencyFlags[balance.code]} className="h-2.5 w-[15px]" />
                  {balance.code}
                </span>
                <p className="mt-1 text-sm font-semibold tabular-nums">{balance.amount}</p>
              </div>
            ))}
          </div>

          {/* Recent payments, as a table rather than a list. */}
          <div className="mt-5 overflow-hidden rounded-xl border border-border bg-card">
            <p className="border-b border-border px-4 py-2.5 text-xs font-semibold">
              Recent payments
            </p>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted">
                  <th className="px-4 py-2 font-medium">Beneficiary</th>
                  <th className="hidden px-2 py-2 font-medium sm:table-cell">Date</th>
                  <th className="px-2 py-2 text-right font-medium">Amount</th>
                  <th className="px-4 py-2 text-right font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.ref}>
                    <td className="px-4 py-2.5">
                      <span className="flex items-center gap-2 text-[11px] font-medium">
                        <Flag code={currencyFlags[payment.code]} className="h-2.5 w-[15px]" />
                        {payment.ref}
                      </span>
                    </td>
                    <td className="hidden px-2 py-2.5 text-[11px] text-muted sm:table-cell">
                      {payment.date}
                    </td>
                    <td className="px-2 py-2.5 text-right text-[11px] tabular-nums">
                      {payment.amount}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[payment.status]}`}
                        style={payment.status === "Approved" ? { color: "var(--tone)" } : undefined}
                      >
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right rail */}
        <div className="hidden flex-col gap-3 border-l border-border p-5 lg:flex">
          <div className="rounded-xl bg-ink p-4 text-on-ink">
            <p className="text-sm font-semibold">Your Company Ltd</p>
            <p className="mt-1 text-[11px] leading-relaxed text-on-ink/60">
              London, United Kingdom
            </p>
            <dl className="mt-4 space-y-2.5 text-[11px]">
              <div>
                <dt className="text-on-ink/50">Account no.</dt>
                <dd className="font-mono">•••• ••••</dd>
              </div>
              <div>
                <dt className="text-on-ink/50">Sort code</dt>
                <dd className="font-mono">••-••-••</dd>
              </div>
              <div>
                <dt className="text-on-ink/50">SWIFT / BIC</dt>
                <dd className="font-mono">••••GB••</dd>
              </div>
              <div>
                <dt className="text-on-ink/50">IBAN</dt>
                <dd className="font-mono">GB•• •••• •••• ••••</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-white/10 pt-3 text-[10px] text-on-ink/40">
              Masked on purpose — this is not a real account.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-semibold">Need help?</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Reach the team that opened your account, not a queue.
            </p>
            <span className="mt-3 inline-flex rounded-full bg-accent px-3 py-1.5 text-[10px] font-semibold text-on-accent">
              Contact
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

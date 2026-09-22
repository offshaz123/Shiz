import { brand } from "@/lib/brand";

/**
 * A preview of what a customer logs into.
 *
 * Everything here is illustrative and the caption says so — no real account,
 * no real balances, and the account identifiers are deliberate placeholders.
 * Built in our own palette rather than our provider's.
 */
const nav = ["Dashboard", "Payments", "Beneficiaries", "Foreign exchange", "Transactions"];

const balances = [
  { code: "GBP", amount: "£15,658.34", active: true },
  { code: "USD", amount: "$18,655.11", active: false },
  { code: "EUR", amount: "€2,586.03", active: false },
];

const payments = [
  { ref: "TXN-58217-CQ", amount: "$3,240.50", status: "Completed" },
  { ref: "TXN-58204-KL", amount: "£1,120.00", status: "Completed" },
  { ref: "TXN-58198-RM", amount: "€880.00", status: "In progress" },
];

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-muted/25" />
      </div>

      <div className="grid md:grid-cols-[180px_1fr] lg:grid-cols-[190px_1fr_230px]">
        {/* Sidebar */}
        <div className="hidden flex-col gap-1 border-r border-border bg-ink p-4 text-on-ink md:flex">
          <span className="font-display mb-4 text-base font-semibold">
            {brand.shortName}
            <span className="text-accent">.</span>
          </span>
          {nav.map((item, index) => (
            <span
              key={item}
              className={`rounded-lg px-3 py-2 text-xs ${
                index === 0 ? "bg-accent text-on-accent font-semibold" : "text-on-ink/60"
              }`}
            >
              {item}
            </span>
          ))}
        </div>

        {/* Main panel */}
        <div className="p-5 sm:p-6">
          <p className="font-display text-lg font-semibold">Welcome back</p>
          <p className="mt-1 text-xs text-muted">Here is your account overview.</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {["Send money", "Exchange"].map((action) => (
              <div
                key={action}
                className="rounded-xl border border-border bg-card px-4 py-3.5 text-center text-xs font-semibold"
              >
                {action}
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
            {balances.map((balance) => (
              <div
                key={balance.code}
                className={`rounded-xl border px-3.5 py-3 ${
                  balance.active ? "border-accent bg-accent-soft" : "border-border bg-background"
                }`}
              >
                <span className="font-mono text-[11px] text-muted">{balance.code}</span>
                <p className="mt-1 text-sm font-semibold tabular-nums">{balance.amount}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border bg-background">
            <p className="border-b border-border px-4 py-2.5 text-xs font-semibold">
              Recent payments
            </p>
            <ul className="divide-y divide-border">
              {payments.map((payment) => (
                <li key={payment.ref} className="flex items-center justify-between gap-3 px-4 py-2.5">
                  <span className="font-mono text-[11px] text-muted">{payment.ref}</span>
                  <span className="text-xs tabular-nums">{payment.amount}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      payment.status === "Completed"
                        ? "bg-accent-soft text-accent"
                        : "bg-surface-2 text-muted"
                    }`}
                  >
                    {payment.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Account details */}
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
                <dt className="text-on-ink/50">IBAN</dt>
                <dd className="font-mono">GB•• •••• •••• ••••</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-semibold">Need help?</p>
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
              Reach the team that opened your account, not a queue.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

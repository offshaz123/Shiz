import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { brand } from "@/lib/brand";
import { currentUser } from "@/lib/session";
import { Section } from "@/components/Section";
import { Icon } from "@/components/Icon";
import { IconTile } from "@/components/IconTile";
import { DashboardRates } from "@/components/DashboardRates";
import { DashboardGreeting } from "@/components/DashboardGreeting";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false, follow: false },
};

const TYPICAL = 0.025;
const TIGHTER = 0.008;

const money = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * What a signed-in person sees instead of the sales pitch.
 *
 * A separate route rather than a swapped-out home page, for two reasons. The
 * home page is statically rendered and worth keeping that way for the
 * public; and swapping a hero client-side means everybody sees the marketing
 * version flash first, which is worse than either version on its own.
 *
 * NOTHING HERE IS INVENTED. There is no application status, no balance and
 * no transaction history, because none of those exist yet — and a dashboard
 * that shows a fake pipeline is worse than one that admits it is early. What
 * it does show is true: who they are, what we still need from them, what a
 * margin costs at the size they told us, and today's reference rates.
 */
export default async function DashboardPage() {
  const me = await currentUser();
  if (!me) redirect("/login");

  const address = me.address;
  const checklist = [
    { label: "Your name", done: Boolean(me.firstName && me.lastName) },
    { label: "Company name", done: Boolean(me.company) },
    { label: "Phone number", done: Boolean(me.phone) },
    { label: "Address", done: Boolean(address?.line1 && address?.postcode) },
    { label: "Monthly volume", done: Boolean(me.monthlyVolume) },
  ];
  const done = checklist.filter((item) => item.done).length;
  const complete = done === checklist.length;

  const volume = me.monthlyVolume ?? 0;
  const saving = volume * (TYPICAL - TIGHTER);

  const joined = new Date(me.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Section>
      <div className="mx-auto max-w-5xl">
        <DashboardGreeting firstName={me.firstName} lastName={me.lastName} />
        <p className="mt-3 text-base leading-relaxed text-muted">
          You have an account with {brand.name}. Here is where you are, and what we would
          need to open a payment account for the business.
        </p>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {/* What we still need. */}
          <div className="card p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold">Your details</h2>
                <p className="mt-1 text-sm text-muted">
                  {complete ? "Everything we asked for is here." : `${done} of ${checklist.length} added.`}
                </p>
              </div>
              <IconTile name={complete ? "shield" : "document"} tone={complete ? 4 : 5} />
            </div>

            {/* A bar, not a ring: it reads at a glance and needs no legend. */}
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent transition-all"
                style={{ width: `${(done / checklist.length) * 100}%` }}
              />
            </div>

            <ul className="mt-5 space-y-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5 text-sm">
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                      item.done ? "bg-[#0e9f6e] text-white" : "border border-border text-muted"
                    }`}
                  >
                    {item.done ? (
                      <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3" aria-hidden="true">
                        <path d="m6 12.5 4 4 8-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : null}
                  </span>
                  <span className={item.done ? "text-muted line-through decoration-border" : ""}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/account" className="btn btn-ghost mt-6 w-full">
              {complete ? "Review your details" : "Finish your details"}
            </Link>
          </div>

          {/* Their own number, or an invitation to give us one. */}
          <div className="rounded-2xl bg-ink p-6 text-on-ink sm:p-7">
            <h2 className="font-display text-lg font-semibold">What the margin costs you</h2>

            {volume > 0 ? (
              <>
                <p className="mt-1 text-sm text-on-ink/60">
                  At {money(volume)} converted a month.
                </p>
                <p className="font-display mt-6 text-5xl font-semibold tabular-nums">
                  {money(saving)}
                </p>
                <p className="mt-2 text-sm text-on-ink/70">
                  a month between a typical 2.5% margin and a tighter 0.8% one —{" "}
                  {money(saving * 12)} over a year.
                </p>
                <p className="mt-5 text-xs leading-relaxed text-on-ink/55">
                  Arithmetic on the figure you gave us, not a quote. What you would actually
                  pay depends on the corridor and the volume.
                </p>
                <Link
                  href="/contact"
                  className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
                >
                  Price one real transaction
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 text-sm text-on-ink/60">
                  Tell us roughly what you convert each month and this becomes your number
                  rather than an example.
                </p>
                <Link
                  href="/account"
                  className="mt-7 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-strong"
                >
                  Add your monthly volume
                </Link>
              </>
            )}
          </div>

          <DashboardRates />

          {/* The honest next step. */}
          <div className="card p-6 sm:p-7">
            <h2 className="font-display text-lg font-semibold">What happens next</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              An account here is not a payment account yet — it is how we know who you are.
              Opening the real thing starts with a conversation and a set of documents.
            </p>

            <div className="mt-5 space-y-2.5">
              {[
                { href: "/contact", icon: "handshake", label: "Tell us about the business" },
                { href: "/opening-an-account", icon: "document", label: "See what the file needs" },
                { href: "/feedback", icon: "chart", label: "Tell us what you think of this" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition-colors hover:border-accent hover:bg-surface"
                >
                  <Icon name={item.icon} className="h-4 w-4 text-accent-2" />
                  {item.label}
                  <span aria-hidden="true" className="ml-auto text-muted">
                    &rarr;
                  </span>
                </Link>
              ))}
            </div>

            <p className="mt-5 border-t border-border pt-4 text-xs text-muted">
              Account opened {joined}.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

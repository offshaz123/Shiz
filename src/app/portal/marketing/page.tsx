import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/client-auth";
import { getAdminClient, getClientSummary } from "@/lib/clients";
import { asTrade, ideasFor, TRADE_WORD } from "@/lib/marketing-ideas";
import { siteConfig } from "@/lib/site-config";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Getting more customers",
  robots: { index: false, follow: false },
};

/**
 * Things to do this week that bring more work in.
 *
 * Picked for the trade they are in and rotated on the date, so the top of
 * the page is different on Thursday from how it was on Monday and nobody
 * learns to skip it.
 *
 * Nothing on it claims a result. An agency telling a client that posting
 * before-and-afters wins them forty per cent more work is an agency
 * making a number up, and the first time somebody asks where it came
 * from they stop believing the figures on every other page too. So these
 * say what to do and why it tends to work, and the pages that do carry
 * numbers carry only their own.
 *
 * One of them each day ends in asking us to do it, marked as such. A page
 * of advice from the people selling the service is advertising wearing a
 * hat; saying which is which is the difference.
 */

const EFFORT_LOOK: Record<string, string> = {
  "ten minutes": "border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
  "an hour": "border-border text-muted",
  "an afternoon": "border-border text-muted",
};

export default async function MarketingPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const [admin, summary] = await Promise.all([
    getAdminClient(client.slug),
    getClientSummary(client.id),
  ]);

  const trade = asTrade(admin?.trade ?? "");
  const ideas = ideasFor(trade);

  // Said only when it is true of their own month, never as a general
  // claim about businesses.
  const slowToReply =
    summary !== null && summary.medianHoursToReply !== null && summary.medianHoursToReply >= 4;

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Getting more customers
      </h1>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">
        A few things worth doing this week. Most of them are free and take ten minutes.
        {trade !== "general" && (
          <>
            {" "}
            Picked for {TRADE_WORD[trade].toLowerCase()}.
          </>
        )}
      </p>

      {slowToReply && summary && (
        <p className="mt-5 rounded-2xl border border-amber-500/50 bg-amber-500/10 px-5 py-4 text-sm leading-relaxed text-foreground">
          <b>Before any of this:</b> enquiries are waiting about{" "}
          {summary.medianHoursToReply} hours for an answer at the moment. More advertising
          into a slow reply is money spent twice. Getting that down is worth more than
          anything on this page.
        </p>
      )}

      {admin?.siteScore !== null && admin !== null && (
        <section className="mt-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
            <div>
              <h2 className="text-sm font-bold text-foreground">Your website</h2>
              <p className="mt-0.5 text-xs text-muted">
                {admin.businessWebsite || "Last time we looked at it"}
              </p>
            </div>
            <div className="text-right">
              <p
                className={`text-3xl font-bold leading-none tracking-tight ${
                  admin.siteScore >= 80
                    ? "text-emerald-600 dark:text-emerald-400"
                    : admin.siteScore >= 50
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-red-600 dark:text-red-400"
                }`}
              >
                {admin.siteScore}
              </p>
              <p className="text-[11px] text-muted">out of 100</p>
            </div>
          </div>

          {admin.siteIssues.length > 0 ? (
            <>
              <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
                Worth fixing
              </p>
              <ul className="mt-2 flex flex-col gap-2.5">
                {admin.siteIssues.map((issue) => (
                  <li key={issue.label} className="text-sm leading-relaxed">
                    <span className="font-semibold text-foreground">{issue.label}</span>
                    <span className="block text-xs leading-relaxed text-muted">{issue.why}</span>
                  </li>
                ))}
              </ul>
              <a
                href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                  `${client.name} — website`,
                )}`}
                className="mt-4 inline-block rounded-full border border-brand-pink/50 px-4 py-2 text-xs font-semibold text-brand-pink"
              >
                Ask us to sort it
              </a>
            </>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Nothing major wrong with it. Advertising into a site that works is money well
              spent.
            </p>
          )}
        </section>
      )}

      <ol className="mt-6 flex flex-col gap-3">
        {ideas.map((idea, i) => (
          <li
            key={idea.id}
            className={`rounded-2xl border p-5 sm:p-6 ${
              idea.cost === "ask-us"
                ? "border-brand-pink/40 bg-surface"
                : "border-border bg-surface"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <h2 className="text-sm font-bold leading-snug text-foreground">
                <span className="mr-2 text-muted">{i + 1}.</span>
                {idea.title}
              </h2>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                  idea.cost === "ask-us"
                    ? "border-brand-pink/50 text-brand-pink"
                    : EFFORT_LOOK[idea.effort]
                }`}
              >
                {idea.cost === "ask-us" ? "We can do this" : idea.effort}
              </span>
            </div>

            <p className="mt-2 text-sm leading-relaxed text-muted">{idea.body}</p>

            {idea.cost === "ask-us" && (
              <a
                href={`mailto:${siteConfig.email}?subject=${encodeURIComponent(
                  `${client.name} — ${idea.title}`,
                )}`}
                className="mt-3 inline-block rounded-full border border-brand-pink/50 px-4 py-2 text-xs font-semibold text-brand-pink"
              >
                Ask us about it
              </a>
            )}
          </li>
        ))}
      </ol>

      <section className="mt-7 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-foreground">Where this comes from</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-muted">
          These are things that work in your line of business, not predictions. You will not
          find a percentage anywhere on this page — if we have not measured it on your account,
          we are not going to put a number on it. The figures that are yours live on your
          results page.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          The list changes through the week. Anything you want a hand with, ring{" "}
          <a href={`tel:${siteConfig.phoneE164}`} className="font-semibold text-foreground">
            {siteConfig.phoneDisplay}
          </a>
          .
        </p>
      </section>

      <p className="mt-6 text-xs text-muted">
        <Link href="/portal/opportunities" className="font-semibold text-brand-pink hover:underline">
          Money on the table
        </Link>{" "}
        is the other half of this — work you have already got that is waiting to be picked up.
      </p>
    </div>
  );
}

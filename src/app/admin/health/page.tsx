import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "../LoginForm";
import { runHealthChecks, type Check } from "@/lib/health";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "System check",
  robots: { index: false, follow: false },
};

/**
 * Is anything broken.
 *
 * Every failure on this page has already happened here once, and not one of
 * them announced itself: a cron job sitting in hPanel looking perfectly
 * healthy while the follow-up sequence was dead for a week, a mailbox that
 * could not be read so the day 3 and day 5 emails were quietly held back, a
 * Places allowance spent with the search box simply returning nothing. Each
 * was found days later, by accident.
 *
 * So the questions get asked out loud, in one place, whenever someone opens
 * this. It makes real connections rather than reading settings — a password
 * that is set and wrong looks exactly like a correct one from the outside —
 * and it never prints a secret, only whether the thing answered.
 */

const TONE: Record<Check["state"], string> = {
  ok: "border-emerald-500/40 bg-emerald-500/5",
  warn: "border-amber-500/50 bg-amber-500/5",
  fail: "border-red-500/50 bg-red-500/5",
  off: "border-border bg-surface",
};

const BADGE: Record<Check["state"], string> = {
  ok: "bg-emerald-500/20 text-emerald-400",
  warn: "bg-amber-500/20 text-amber-500",
  fail: "bg-red-500/20 text-red-400",
  off: "bg-border text-muted",
};

const WORD: Record<Check["state"], string> = {
  ok: "Working",
  warn: "Watch",
  fail: "Broken",
  off: "Off",
};

export default async function AdminHealthPage() {
  if (!(await isAdmin())) return <LoginForm />;

  const checks = await runHealthChecks();
  const broken = checks.filter((c) => c.state === "fail").length;
  const watch = checks.filter((c) => c.state === "warn").length;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">System check</h1>
          <p className="mt-1 text-sm text-muted">
            Run fresh every time you open this page. Nothing here is cached.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Back to leads
        </Link>
      </div>

      <p className="mt-6 text-sm font-semibold text-foreground">
        {broken > 0
          ? `${broken} thing${broken === 1 ? "" : "s"} broken${watch ? `, ${watch} to watch` : ""}.`
          : watch > 0
            ? `Everything works. ${watch} thing${watch === 1 ? "" : "s"} worth a look.`
            : "Everything works."}
      </p>

      <ul className="mt-4 flex flex-col gap-3">
        {checks.map((check) => (
          <li key={check.name} className={`rounded-2xl border p-5 ${TONE[check.state]}`}>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-sm font-bold text-foreground">{check.name}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${BADGE[check.state]}`}
              >
                {WORD[check.state]}
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{check.detail}</p>
            {check.fix && (
              <p className="mt-2 text-xs leading-relaxed text-muted">{check.fix}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-xs leading-relaxed text-muted">
        This page makes real connections — it logs into the mail server and queries the database
        rather than reading settings, because a password that is set and wrong looks exactly like
        a correct one. It never shows a password or a key, only whether the thing answered.
      </p>
    </div>
  );
}

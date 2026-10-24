"use client";

import { useState } from "react";
import Link from "next/link";
import { ScanBrowserFrame } from "./ScanBrowserFrame";

export type ScanLead = {
  name: string;
  email: string;
  phone: string;
  website: string;
  marketingConsent: boolean;
};

/**
 * The gate in front of a scan. Takes the details, then hands them up so the
 * parent can record the lead and start the audit.
 *
 * The consent box is unticked, names us, and is separate from the submit
 * button on purpose. Under PECR the person running a scan is a prospective
 * customer, not an existing one, so the soft opt-in does not cover them: the
 * follow-up sequence may only go to people who tick this. Their report is a
 * different matter — they asked for that, so it goes either way.
 */
export function ScanLeadForm({
  initialUrl,
  onStart,
}: {
  initialUrl: string;
  onStart: (lead: ScanLead) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState(initialUrl);
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState("");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (honey) return;

    const site = website.trim();
    if (!name.trim() || !email.trim() || !phone.trim() || !site) {
      setError("We need all four to run the check and send you the report.");
      return;
    }
    if (!/\./.test(site)) {
      setError("That doesn't look like a web address. Try something like yourbusiness.co.uk");
      return;
    }
    setError("");
    onStart({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      website: site,
      marketingConsent: consent,
    });
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground placeholder:text-muted focus:border-brand-pink/60 focus:outline-none";

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-start lg:gap-14">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Free website check
        </span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Where to send your report
        </h1>
        <p className="mt-4 leading-relaxed text-muted">
          We check the tracking, how Google reads your pages, how easy you are to contact and
          what your online presence looks like. It takes about twenty seconds.
        </p>

        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="lead-name" className="mb-1.5 block text-sm text-muted">
                Your name
              </label>
              <input
                id="lead-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={field}
              />
            </div>
            <div>
              <label htmlFor="lead-phone" className="mb-1.5 block text-sm text-muted">
                Phone number
              </label>
              <input
                id="lead-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                className={field}
              />
            </div>
          </div>

          <div>
            <label htmlFor="lead-email" className="mb-1.5 block text-sm text-muted">
              Email address
            </label>
            <input
              id="lead-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@yourbusiness.co.uk"
              className={field}
            />
          </div>

          <div>
            <label htmlFor="lead-website" className="mb-1.5 block text-sm text-muted">
              Website to check
            </label>
            <input
              id="lead-website"
              type="text"
              inputMode="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="yourbusiness.co.uk"
              className={field}
            />
          </div>

          {/* Honeypot — hidden from people, catches the simpler bots. */}
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
            className="hidden"
          />

          <label
            htmlFor="lead-consent"
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-4"
          >
            <input
              id="lead-consent"
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-pink)]"
            />
            <span className="text-sm leading-relaxed text-muted">
              Email me occasional tips from Shaz Marketing Group on improving my score. You can
              unsubscribe at any time.
            </span>
          </label>

          <button
            type="submit"
            className="brand-gradient-bg mt-1 rounded-xl px-7 py-4 text-base font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:scale-[1.01]"
          >
            Run My Free Audit
          </button>

          <p className="text-xs leading-relaxed text-muted">
            We&apos;ll send your report to the address above and may call about it. See our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>
            .
          </p>

          {error && (
            <p className="rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-sm text-foreground">
              {error}
            </p>
          )}
        </form>
      </div>

      {/* The frame sits here from the start so the page does not jump when the
          scan begins; it simply starts filling in. */}
      <div className="lg:sticky lg:top-28">
        <ScanBrowserFrame url={website} revealed={0} />
        <p className="mt-3 text-center text-xs text-muted">
          We check five areas of your site and show you each one.
        </p>
      </div>
    </div>
  );
}

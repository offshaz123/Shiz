"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AdminClient } from "@/lib/clients";
import { siteConfig } from "@/lib/site-config";

/**
 * The list of clients, and the form that adds one.
 *
 * It used to be the whole admin side of a client: every row carried the ad
 * spend boxes, the review link, the job value, the instant reply wording and
 * the form code, so eight clients was a page you scrolled for a minute and
 * the thing you came to find — who is quiet, who is new — was nowhere. Each
 * client now has their own page and this is a list again.
 *
 * What a list is for is noticing. So each row answers three questions and no
 * others: how many enquiries have they ever had, when was the last one, and
 * when did they last sign in and look. The last one is the awkward question
 * before a renewal call — a client who has not opened their dashboard since
 * March did not read the figures we keep pointing them at — and it is not
 * visible anywhere else.
 *
 * Both are said as "three days ago" rather than as a date. A date is a
 * number to subtract from today before it means anything, and the meaning
 * is the whole reason the line is there.
 *
 * Two absences are flagged in the margin, because nobody scrolls a list
 * looking for one: a client who was getting enquiries and has stopped, and
 * an account nobody has ever signed into.
 */

/** Days of silence before a client who was getting enquiries is flagged. */
const QUIET_AFTER_DAYS = 14;

function daysSince(iso: string): number | null {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return null;
  return Math.floor((Date.now() - at.getTime()) / 86_400_000);
}

/** "today", "yesterday", "3 days ago" — never a date to work out. */
function ago(iso: string): string {
  const days = daysSince(iso);
  if (days === null) return "";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return "over a year ago";
}

export function ClientManager() {
  const [clients, setClients] = useState<AdminClient[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", slug: "", contactEmail: "", password: "" });

  useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/clients")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) setClients(data.clients ?? []);
      })
      .catch(() => {
        if (!cancelled) {
          setClients([]);
          setError("Could not load the clients.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    const res = await fetch("/api/admin/clients");
    if (res.ok) setClients((await res.json()).clients ?? []);
  }

  async function create() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? String(res.status));
      }
      setForm({ name: "", slug: "", contactEmail: "", password: "" });
      await load();
    } catch (err) {
      setError(
        String(err).includes("weak_password")
          ? "The password needs to be at least 8 characters."
          : "Not created. That account name may already be taken.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section id="list" className="scroll-mt-6 rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Clients</h2>
          <p className="mt-0.5 text-xs text-muted">
            Tap one to see everything about them. They sign in at{" "}
            {siteConfig.url.replace(/^https?:\/\//, "")}/portal
          </p>
        </div>

        {clients === null ? (
          <p className="px-5 py-5 text-sm text-muted">Loading…</p>
        ) : clients.length === 0 ? (
          <p className="px-5 py-5 text-sm text-muted">No clients yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {clients.map((client) => {
              const silent = client.lastLeadAt ? daysSince(client.lastLeadAt) : null;
              const quiet =
                client.isActive &&
                client.leads > 0 &&
                silent !== null &&
                silent >= QUIET_AFTER_DAYS;
              // Worth seeing on its own: an account made and never opened is
              // not a quiet month, it is a handover that never happened.
              const neverIn = client.isActive && !client.lastLoginAt;

              return (
                <li key={client.id}>
                  <Link
                    href={`/admin/clients/${client.slug}`}
                    className="flex items-center gap-3 px-5 py-4 transition hover:bg-background"
                  >
                    {client.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={client.logoUrl}
                        alt=""
                        className="h-9 w-9 shrink-0 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-sm font-bold text-muted">
                        {client.name.slice(0, 1).toUpperCase()}
                      </span>
                    )}

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline gap-x-2">
                        <span className="text-sm font-semibold text-foreground">
                          {client.name}
                        </span>
                        <span className="text-xs text-muted">{client.slug}</span>
                        {!client.isActive && (
                          <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                            switched off
                          </span>
                        )}
                      </span>
                      <span
                        className={`mt-0.5 block text-xs ${
                          quiet ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted"
                        }`}
                      >
                        {client.leads} enquir{client.leads === 1 ? "y" : "ies"}
                        {client.lastLeadAt
                          ? ` · last one ${ago(client.lastLeadAt)}`
                          : " yet"}
                        {quiet && " — worth a call"}
                      </span>
                      <span
                        className={`mt-0.5 block text-[11px] ${
                          neverIn
                            ? "font-medium text-amber-600 dark:text-amber-400"
                            : "text-muted"
                        }`}
                      >
                        {client.lastLoginAt
                          ? `Signed in ${ago(client.lastLoginAt)}`
                          : "Has never signed in"}
                      </span>
                    </span>

                    <span aria-hidden className="shrink-0 text-muted">
                      ›
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section id="add" className="scroll-mt-6 rounded-2xl border border-border bg-surface p-5">
        <h2 className="text-sm font-semibold text-foreground">Add a client</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          The account name is what they sign in with and what goes in their form snippet. Keep it
          short and permanent: it cannot be changed without breaking their form.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Business name</span>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Auto Wrap Manchester"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Account name</span>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="autowrap"
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Their email</span>
            <input
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted">Password (8+ characters)</span>
            <input
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <span className="text-[11px] text-muted">
              Copy it before you leave this page. It is stored hashed, so nobody can read it back,
              including you.
            </span>
          </label>
        </div>

        <button
          type="button"
          onClick={create}
          disabled={busy}
          className="brand-gradient-bg mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Create client"}
        </button>
        {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}
      </section>
    </div>
  );
}

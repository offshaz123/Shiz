"use client";

import { useEffect, useState } from "react";
import type { AdminClient } from "@/lib/clients";
import { siteConfig } from "@/lib/site-config";

/**
 * Setting a client up and keeping their figures fed.
 *
 * Three jobs, in the order they happen: create the account, give them the
 * form snippet for their website, and type in what they spent this month.
 *
 * The spend box exists because cost per enquiry is the most useful figure
 * on the client's dashboard and it cannot be worked out without it. Pulling
 * it from Google automatically needs a developer token that takes weeks to
 * approve, and a number typed in once a month beats an empty panel waiting
 * on an application.
 */

const CHANNELS = ["google", "meta"] as const;

function thisMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function snippetFor(slug: string): string {
  return `<form id="enquiry">
  <input name="name" placeholder="Your name">
  <input name="phone" placeholder="Phone">
  <input name="email" type="email" placeholder="Email">
  <textarea name="message" placeholder="How can we help?"></textarea>
  <!-- Hidden. A person never fills this in; a bot usually does. -->
  <input name="website_url" style="position:absolute;left:-9999px" tabindex="-1" autocomplete="off">
  <button type="submit">Send</button>
</form>

<script>
document.getElementById('enquiry').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  await fetch('${siteConfig.url}/api/lead-capture', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client: '${slug}',
      name: f.get('name'), phone: f.get('phone'),
      email: f.get('email'), message: f.get('message'),
      website_url: f.get('website_url'),
      // Change this per landing page so the dashboard can tell
      // Google Ads enquiries from Facebook ones.
      source: 'website',
      page: location.pathname,
    }),
  });
  e.target.innerHTML = '<p>Thanks, we will be in touch shortly.</p>';
});
</script>`;
}

export function ClientManager() {
  const [clients, setClients] = useState<AdminClient[] | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showSnippet, setShowSnippet] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", contactEmail: "", password: "" });
  const [spend, setSpend] = useState<Record<number, { month: string; channel: string; amount: string }>>({});

  async function fetchClients(): Promise<AdminClient[]> {
    const res = await fetch("/api/admin/clients");
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    return data.clients as AdminClient[];
  }

  async function load() {
    try {
      setClients(await fetchClients());
    } catch {
      setError("Could not read the client list.");
    }
  }

  // Matches how the call list loads: the promise settles before anything is
  // set, and a cancelled flag stops a slow response writing to a component
  // that has since gone.
  useEffect(() => {
    let cancelled = false;
    fetchClients()
      .then((list) => {
        if (!cancelled) setClients(list);
      })
      .catch(() => {
        if (!cancelled) setError("Could not read the client list.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  async function patch(id: number, body: Record<string, unknown>, failure: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...body }),
      });
      if (!res.ok) throw new Error(String(res.status));
      await load();
    } catch {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-surface p-5">
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
              Shown once here. It is stored hashed, so nobody can read it back, including you.
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

      <section className="rounded-2xl border border-border bg-surface">
        <div className="border-b border-border px-5 py-4">
          <h2 className="text-sm font-semibold text-foreground">Clients</h2>
          <p className="mt-0.5 text-xs text-muted">
            Their dashboard is at {siteConfig.url.replace(/^https?:\/\//, "")}/portal
          </p>
        </div>

        {clients === null ? (
          <p className="px-5 py-5 text-sm text-muted">Loading…</p>
        ) : clients.length === 0 ? (
          <p className="px-5 py-5 text-sm text-muted">No clients yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {clients.map((client) => {
              const entry = spend[client.id] ?? { month: thisMonth(), channel: "google", amount: "" };
              return (
                <li key={client.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold text-foreground">{client.name}</span>
                    <span className="text-xs text-muted">{client.slug}</span>
                    {!client.isActive && (
                      <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                        switched off
                      </span>
                    )}
                    <span className="ml-auto text-xs tabular-nums text-muted">
                      {client.leads} enquir{client.leads === 1 ? "y" : "ies"}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-2">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-muted">Month</span>
                      <input
                        type="month"
                        value={entry.month}
                        onChange={(e) =>
                          setSpend({ ...spend, [client.id]: { ...entry, month: e.target.value } })
                        }
                        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-muted">Channel</span>
                      <select
                        value={entry.channel}
                        onChange={(e) =>
                          setSpend({ ...spend, [client.id]: { ...entry, channel: e.target.value } })
                        }
                        className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      >
                        {CHANNELS.map((c) => (
                          <option key={c} value={c}>
                            {c === "google" ? "Google Ads" : "Meta"}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-muted">Ad spend £</span>
                      <input
                        inputMode="decimal"
                        value={entry.amount}
                        onChange={(e) =>
                          setSpend({ ...spend, [client.id]: { ...entry, amount: e.target.value } })
                        }
                        placeholder="600"
                        className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busy || !entry.amount}
                      onClick={() =>
                        patch(
                          client.id,
                          { month: entry.month, channel: entry.channel, amount: Number(entry.amount) },
                          "Spend not saved.",
                        )
                      }
                      className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground disabled:opacity-40"
                    >
                      Save spend
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
                    <label className="flex flex-col gap-1">
                      <span className="text-[11px] text-muted">Average job value £</span>
                      <input
                        defaultValue={client.defaultLeadValue ?? ""}
                        onBlur={(e) => {
                          const next = e.target.value.trim();
                          if (next !== String(client.defaultLeadValue ?? "")) {
                            void patch(
                              client.id,
                              { defaultLeadValue: next === "" ? null : Number(next) },
                              "That value did not save.",
                            );
                          }
                        }}
                        placeholder="500"
                        inputMode="decimal"
                        className="w-24 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </label>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                    What one job is worth to them on average. Every new enquiry comes in at this
                    figure, so their revenue fills in by itself. They can change it on a single
                    job that was bigger or smaller.
                  </p>

                  <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3">
                    <label className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="text-[11px] text-muted">
                        Their Google review link
                      </span>
                      <input
                        defaultValue={client.reviewLink}
                        onBlur={(e) => {
                          if (e.target.value !== client.reviewLink) {
                            void patch(
                              client.id,
                              { reviewLink: e.target.value },
                              "That did not look like a link. It needs to start with https://",
                            );
                          }
                        }}
                        placeholder="https://g.page/r/..."
                        className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground"
                      />
                    </label>
                    <button
                      type="button"
                      disabled={busy || (!client.reviewLink && !client.reviewRequestsOn)}
                      onClick={() =>
                        patch(
                          client.id,
                          { reviewRequestsOn: !client.reviewRequestsOn },
                          "Not changed.",
                        )
                      }
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold disabled:opacity-40 ${
                        client.reviewRequestsOn
                          ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                          : "border-border text-muted"
                      }`}
                    >
                      {client.reviewRequestsOn ? "Review asks on" : "Review asks off"}
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
                    When a job is marked done, their customer gets one email the next day asking
                    for a review. Needs the link, and only ever sends once per job.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setShowSnippet(showSnippet === client.slug ? null : client.slug)}
                      className="font-semibold text-brand-pink hover:underline"
                    >
                      {showSnippet === client.slug ? "Hide form code" : "Form code for their site"}
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => {
                        const next = prompt(`New password for ${client.name} (8+ characters)`);
                        if (next) void patch(client.id, { password: next }, "Password not changed.");
                      }}
                      className="text-muted hover:text-foreground"
                    >
                      Reset password
                    </button>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => patch(client.id, { isActive: !client.isActive }, "Not changed.")}
                      className="text-muted hover:text-foreground"
                    >
                      {client.isActive ? "Switch off" : "Switch back on"}
                    </button>
                  </div>

                  {showSnippet === client.slug && (
                    <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-3 text-[11px] leading-relaxed text-muted">
                      {snippetFor(client.slug)}
                    </pre>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

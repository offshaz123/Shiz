"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminClient } from "@/lib/clients";
import { siteConfig } from "@/lib/site-config";
import { TRADES, TRADE_WORD } from "@/lib/marketing-ideas";

/**
 * Everything that can be changed about one client, on that client's page.
 *
 * These controls used to sit inside each row of the client list, which meant
 * the list was twelve inputs tall per client and the thing you actually
 * wanted — who they are and whether they are getting enquiries — was buried
 * under the things you change twice a year. One client, one page, and the
 * list goes back to being a list.
 *
 * Grouped by the question being answered rather than by which table the
 * column lives in: what a job is worth, what goes out automatically, what
 * their portal looks like, and the account itself.
 *
 * Text boxes save when you click away rather than on a Save button, and only
 * when the value actually changed. A Save button per box is four buttons
 * nobody presses; a request on every keystroke is a request per keystroke.
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

function Group({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-muted">{note}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const INPUT =
  "rounded-lg border border-border bg-background px-2.5 py-2 text-xs text-foreground";

export function ClientSettings({ client }: { client: AdminClient }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [snippet, setSnippet] = useState(false);
  const [spend, setSpend] = useState({ month: thisMonth(), channel: "google", amount: "" });
  const [website, setWebsite] = useState(client.businessWebsite ?? "");
  const [scanning, setScanning] = useState(false);

  async function patch(body: Record<string, unknown>, failure: string, ok = "Saved.") {
    setBusy(true);
    setError("");
    setSaved("");
    try {
      const res = await fetch("/api/admin/clients", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: client.id, ...body }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaved(ok);
      // The page around this is rendered on the server, so without a
      // refresh the figures above keep showing what they showed before
      // the change and it looks as though nothing happened.
      router.refresh();
    } catch {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {(error || saved) && (
        <p
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
            error
              ? "border-red-500/40 text-red-500"
              : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {error || saved}
        </p>
      )}

      <Group
        title="Their website"
        note="Put it in and scan it. The scan works out what they do, so their More customers page talks about their trade, and keeps the handful of things on their site most worth fixing."
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[11px] text-muted">Website address</span>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="platedup.co.uk"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className={`w-full ${INPUT}`}
            />
          </label>
          <button
            type="button"
            disabled={scanning || !website.trim()}
            onClick={async () => {
              setScanning(true);
              setError("");
              setSaved("");
              try {
                const res = await fetch("/api/admin/clients/scan", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ slug: client.slug, url: website }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error ?? String(res.status));
                setSaved(
                  `Scanned: ${data.score} out of 100${
                    data.guessed ? `, and set to ${data.trade.replace(/-/g, " ")}` : ""
                  }.`,
                );
                router.refresh();
              } catch (err) {
                setError(
                  String(err).includes("could_not_reach_it")
                    ? "Could not reach that website. Check the address."
                    : "The scan did not finish. Try again in a moment.",
                );
              } finally {
                setScanning(false);
              }
            }}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            {scanning ? "Scanning…" : "Scan it"}
          </button>
        </div>

        {client.siteScore !== null && (
          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            Last scan: <b className="text-foreground">{client.siteScore} out of 100</b>
            {client.siteIssues.length > 0 && (
              <>
                {" "}
                · {client.siteIssues.length} thing
                {client.siteIssues.length === 1 ? "" : "s"} worth fixing, shown on their
                More customers page.
              </>
            )}
          </p>
        )}
      </Group>

      <Group
        title="What line of work they are in"
        note="Decides which ideas their More customers page shows. Left unset they get advice anybody can use, which is fine but duller."
      >
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted">Trade</span>
          <select
            defaultValue={client.trade}
            onChange={(e) => void patch({ trade: e.target.value }, "That did not save.")}
            className={`w-full max-w-xs ${INPUT}`}
          >
            <option value="">Not set</option>
            {TRADES.filter((trade) => trade !== "general").map((trade) => (
              <option key={trade} value={trade}>
                {TRADE_WORD[trade]}
              </option>
            ))}
          </select>
        </label>
      </Group>

      <Group
        title="What a job is worth"
        note="Every new enquiry comes in at this figure, so their revenue fills in by itself. They can change it on a single job that was bigger or smaller."
      >
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted">Average job value £</span>
          <input
            defaultValue={client.defaultLeadValue ?? ""}
            onBlur={(e) => {
              const next = e.target.value.trim();
              if (next !== String(client.defaultLeadValue ?? "")) {
                void patch(
                  { defaultLeadValue: next === "" ? null : Number(next) },
                  "That value did not save.",
                );
              }
            }}
            placeholder="500"
            inputMode="decimal"
            className={`w-28 ${INPUT}`}
          />
        </label>
      </Group>

      <Group
        title="What they spent on advertising"
        note="Typed in once a month. It is the only thing cost per enquiry can be worked out from, so an empty month shows as “not recorded” on their dashboard rather than as £0."
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Month</span>
            <input
              type="month"
              value={spend.month}
              onChange={(e) => setSpend({ ...spend, month: e.target.value })}
              className={INPUT}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Where</span>
            <select
              value={spend.channel}
              onChange={(e) => setSpend({ ...spend, channel: e.target.value })}
              className={INPUT}
            >
              {CHANNELS.map((c) => (
                <option key={c} value={c}>
                  {c === "google" ? "Google Ads" : "Meta"}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Spent £</span>
            <input
              inputMode="decimal"
              value={spend.amount}
              onChange={(e) => setSpend({ ...spend, amount: e.target.value })}
              placeholder="600"
              className={`w-24 ${INPUT}`}
            />
          </label>
          <button
            type="button"
            disabled={busy || !spend.amount}
            onClick={() =>
              patch(
                { month: spend.month, channel: spend.channel, amount: Number(spend.amount) },
                "Spend not saved.",
                "Spend saved.",
              )
            }
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            Save spend
          </button>
        </div>
      </Group>

      <Group
        title="The instant reply"
        note="Sent within seconds of an enquiry arriving, signed with their business name, with replies going to their address. It does not count as them answering, so their reply time stays honest."
      >
        <button
          type="button"
          disabled={busy}
          onClick={() => patch({ autoReplyOn: !client.autoReplyOn }, "Not changed.")}
          className={`rounded-full border px-4 py-2 text-xs font-semibold disabled:opacity-40 ${
            client.autoReplyOn
              ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
              : "border-border text-muted"
          }`}
        >
          {client.autoReplyOn ? "On" : "Off"}
        </button>

        <label className="mt-3 flex flex-col gap-1">
          <span className="text-[11px] text-muted">What it says</span>
          <textarea
            defaultValue={client.autoReplyText}
            onBlur={(e) => {
              if (e.target.value !== client.autoReplyText) {
                void patch({ autoReplyText: e.target.value }, "That did not save.");
              }
            }}
            rows={4}
            placeholder={
              "Thanks for getting in touch. I've got your message and I'll come back to you shortly.\n\nIf it's urgent, give me a ring."
            }
            className={`w-full leading-relaxed ${INPUT}`}
          />
          <span className="text-[11px] text-muted">
            Leave it blank to use the wording above.
          </span>
        </label>
      </Group>

      <Group
        title="Asking their customers for reviews"
        note="When a job is marked done, their customer gets one email the next day asking for a review. Needs the link, and only ever sends once per job."
      >
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[11px] text-muted">Their Google review link</span>
            <input
              defaultValue={client.reviewLink}
              onBlur={(e) => {
                if (e.target.value !== client.reviewLink) {
                  void patch(
                    { reviewLink: e.target.value },
                    "That did not look like a link. It needs to start with https://",
                  );
                }
              }}
              placeholder="https://g.page/r/..."
              className={`w-full ${INPUT}`}
            />
          </label>
          <button
            type="button"
            disabled={busy || (!client.reviewLink && !client.reviewRequestsOn)}
            onClick={() => patch({ reviewRequestsOn: !client.reviewRequestsOn }, "Not changed.")}
            className={`rounded-full border px-4 py-2 text-xs font-semibold disabled:opacity-40 ${
              client.reviewRequestsOn
                ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                : "border-border text-muted"
            }`}
          >
            {client.reviewRequestsOn ? "On" : "Off"}
          </button>
        </div>
      </Group>

      <Group
        title="Their portal"
        note="Their own logo at the top of their dashboard and diary, so it reads as their system rather than ours."
      >
        <label className="flex flex-col gap-1">
          <span className="text-[11px] text-muted">Logo address</span>
          <input
            defaultValue={client.logoUrl}
            onBlur={(e) => {
              if (e.target.value !== client.logoUrl) {
                void patch(
                  { logoUrl: e.target.value },
                  "That did not look like a link. It needs to start with https://",
                );
              }
            }}
            placeholder="https://theirsite.co.uk/logo.png"
            className={`w-full ${INPUT}`}
          />
        </label>
      </Group>

      <Group
        title="The form on their website"
        note="Paste this where their enquiry form goes. Anything it sends lands in their dashboard and, if the instant reply is on, gets answered straight away."
      >
        <button
          type="button"
          onClick={() => setSnippet(!snippet)}
          className="text-xs font-semibold text-brand-pink hover:underline"
        >
          {snippet ? "Hide the code" : "Show the code"}
        </button>
        {snippet && (
          <pre className="mt-3 overflow-x-auto rounded-xl border border-border bg-background p-3 text-[11px] leading-relaxed text-muted">
            {snippetFor(client.slug)}
          </pre>
        )}
      </Group>

      <Group
        title="The account"
        note="A new password is shown to you once here and stored hashed, so nobody can read it back afterwards, including us. Switching a client off takes their login away without deleting anything."
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const next = prompt(`New password for ${client.name} (8 characters or more)`);
              if (next) void patch({ password: next }, "Password not changed.", "Password changed.");
            }}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-40"
          >
            Reset password
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ isActive: !client.isActive }, "Not changed.")}
            className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-40"
          >
            {client.isActive ? "Switch this account off" : "Switch this account back on"}
          </button>
        </div>
      </Group>
    </div>
  );
}

"use client";

import { useState } from "react";

/**
 * Looking a business up on the official register.
 *
 * The question it exists to answer is the one the call list cannot: limited
 * company, or a person trading under a name? Under PECR that decides whether
 * a three-email sequence is lawful, and until now it was a guess made from
 * the look of the name.
 *
 * Deliberately a search you run, not something stamped automatically onto a
 * prospect. The register is about a legal entity and the call list is about a
 * shop front; plenty of trades are a person, and plenty of addresses hold
 * several companies. A guess at the match presented as fact would be worse
 * than making somebody look for ten seconds.
 */

type Hit = {
  number: string;
  title: string;
  status: string;
  kind: string;
  address: string;
  incorporatedOn: string;
};

type Detail = Hit & {
  sic: string[];
  accountsNextDue: string;
  accountsOverdue: boolean;
  confirmationNextDue: string;
  officers: { name: string; role: string; appointedOn: string }[];
};

function years(since: string): string {
  if (!since) return "";
  const started = new Date(since);
  if (Number.isNaN(started.getTime())) return "";
  const months = Math.floor((Date.now() - started.getTime()) / (30.44 * 86_400_000));
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} old`;
  const y = Math.floor(months / 12);
  return `${y} year${y === 1 ? "" : "s"} old`;
}

/** The one line that matters before you write to them. */
function verdict(c: Detail): { text: string; tone: string } {
  if (c.status !== "active") {
    return {
      text: `This company is ${c.status.replace(/-/g, " ")}. Whoever is trading is doing it under something else.`,
      tone: "text-red-500",
    };
  }
  if (/limited|public|partnership|guarantee|society|charity/i.test(c.kind)) {
    return {
      text: "A registered company, so a sequence with an unsubscribe link is on the right side of PECR.",
      tone: "text-emerald-500",
    };
  }
  return {
    text: "Not an obvious limited company — check before running a sequence to them.",
    tone: "text-amber-500",
  };
}

export function CompanyLookup() {
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [company, setCompany] = useState<Detail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!query.trim() || busy) return;
    setBusy(true);
    setError("");
    setCompany(null);
    try {
      const res = await fetch(`/api/admin/company?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message ?? "That didn't work.");
        setHits(null);
      } else {
        setHits(data.results as Hit[]);
      }
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  async function open(number: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/company?number=${encodeURIComponent(number)}`);
      const data = await res.json();
      if (!res.ok) setError(data?.message ?? "That didn't work.");
      else setCompany(data.company as Detail);
    } catch {
      setError("Couldn't reach the server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Business name, or a company number"
          className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-pink"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-brand-pink px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50"
        >
          {busy ? "Looking…" : "Look up"}
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
          {error}
        </p>
      )}

      {company && (
        <div className="mt-5 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-bold text-foreground">{company.title}</h2>
            <span className="rounded-full border border-border px-2.5 py-0.5 text-[11px] font-semibold text-muted">
              {company.number}
            </span>
            <button
              type="button"
              onClick={() => setCompany(null)}
              className="ml-auto text-xs font-semibold text-muted hover:text-foreground"
            >
              Close
            </button>
          </div>

          <p className={`mt-2 text-sm font-semibold ${verdict(company).tone}`}>
            {verdict(company).text}
          </p>

          <div className="mt-4 grid gap-x-6 gap-y-1.5 text-xs sm:grid-cols-2">
            <Fact label="Type" value={company.kind} />
            <Fact label="Status" value={company.status.replace(/-/g, " ")} />
            <Fact
              label="Incorporated"
              value={
                company.incorporatedOn
                  ? `${company.incorporatedOn} (${years(company.incorporatedOn)})`
                  : "—"
              }
            />
            <Fact
              label="Accounts due"
              value={
                company.accountsNextDue
                  ? `${company.accountsNextDue}${company.accountsOverdue ? " — OVERDUE" : ""}`
                  : "—"
              }
            />
            <Fact label="Registered office" value={company.address || "—"} />
            <Fact label="What they do (SIC)" value={company.sic.join(", ") || "—"} />
          </div>

          {company.officers.length > 0 && (
            <div className="mt-4">
              <div className="text-[11px] font-bold uppercase tracking-wide text-muted">
                Who runs it
              </div>
              <ul className="mt-1 flex flex-col gap-0.5 text-xs text-foreground">
                {company.officers.map((o) => (
                  <li key={`${o.name}-${o.appointedOn}`}>
                    {o.name} <span className="text-muted">— {o.role}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-[11px] text-muted">
                Worth having in front of you before you ring: asking for the person who runs it by
                name gets past a receptionist that &ldquo;the owner&rdquo; does not.
              </p>
            </div>
          )}

          <a
            href={`https://find-and-update.company-information.service.gov.uk/company/${company.number}`}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-4 inline-block text-xs font-semibold text-muted underline hover:text-foreground"
          >
            Open the full record on Companies House ↗
          </a>
        </div>
      )}

      {hits && !company && (
        <ul className="mt-5 flex flex-col gap-2">
          {hits.length === 0 && <li className="text-sm text-muted">Nothing on the register matches that.</li>}
          {hits.map((h) => (
            <li key={h.number}>
              <button
                type="button"
                onClick={() => open(h.number)}
                className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-left hover:border-brand-pink"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-foreground">{h.title}</span>
                  <span className="text-[11px] text-muted">{h.number}</span>
                  <span
                    className={`text-[11px] font-semibold ${
                      h.status === "active" ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {h.status.replace(/-/g, " ")}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted">
                  {h.kind}
                  {h.incorporatedOn ? ` · ${years(h.incorporatedOn)}` : ""}
                  {h.address ? ` · ${h.address}` : ""}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="min-w-[8rem] font-semibold text-muted">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

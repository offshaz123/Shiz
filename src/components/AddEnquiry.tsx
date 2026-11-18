"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Putting in an enquiry that did not come through a form.
 *
 * Most of these businesses take as many jobs over the phone, off the van
 * and by word of mouth as they do through a website, and until now only
 * the website ones existed. That made every figure on their dashboard a
 * count of the website rather than a count of their business — which is
 * both the wrong thing to measure and the wrong thing to be judged on.
 *
 * Four boxes and a button, with everything else optional, because this
 * gets filled in one-handed while somebody is still on the phone. The
 * name is the only thing it insists on.
 *
 * "They have already been answered" is ticked by default. Somebody typing
 * up Tuesday's call on Thursday is not two days slow at replying, and a
 * reply time wrecked by their own book-keeping is a number they would
 * stop trusting immediately.
 */

const SOURCES = [
  { value: "phone", label: "Phone call" },
  { value: "walk-in", label: "Walked in" },
  { value: "referral", label: "Recommended" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "maps", label: "Google Maps" },
  { value: "repeat", label: "Been before" },
  { value: "other", label: "Somewhere else" },
];

const STAGES = [
  { value: "new", label: "Just come in" },
  { value: "contacted", label: "Spoken to them" },
  { value: "quoted", label: "Given them a price" },
  { value: "customer", label: "Booked in" },
];

const FIELD =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-pink";

const EMPTY = {
  name: "",
  phone: "",
  email: "",
  message: "",
  source: "phone",
  status: "new",
  value: "",
};

export function AddEnquiry() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...EMPTY });
  const [answered, setAnswered] = useState(true);

  async function save() {
    if (!form.name.trim()) {
      setError("It needs a name, even if it is just “the chap with the Transit”.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/portal/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: form.value.trim() === "" ? null : Number(form.value),
          alreadyAnswered: answered,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setForm({ ...EMPTY });
      setOpen(false);
      router.refresh();
    } catch {
      setError("That did not save. Write the details down before trying again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground"
      >
        + Add an enquiry
      </button>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-pink/50 bg-surface p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Add an enquiry</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-muted">
            Somebody who rang, walked in, or was passed your number. Only the name is needed.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          aria-label="Close"
          className="shrink-0 text-sm text-muted hover:text-foreground"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-muted">Their name</span>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Mrs J Whitfield"
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Phone</span>
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            inputMode="tel"
            placeholder="07700 900123"
            className={FIELD}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Email</span>
          <input
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            type="email"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            className={FIELD}
          />
        </label>

        <label className="flex flex-col gap-1.5 sm:col-span-2">
          <span className="text-xs font-medium text-muted">What are they after?</span>
          <textarea
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            rows={2}
            placeholder="Full wrap on a Transit, wants it before Christmas"
            className={`${FIELD} leading-relaxed`}
          />
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Where did they come from?</span>
          <select
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            className={FIELD}
          >
            {SOURCES.map((source) => (
              <option key={source.value} value={source.value}>
                {source.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">Where is it up to?</span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={FIELD}
          >
            {STAGES.map((stage) => (
              <option key={stage.value} value={stage.value}>
                {stage.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-muted">What is it worth? £</span>
          <input
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            inputMode="decimal"
            placeholder="Leave blank for your usual"
            className={FIELD}
          />
        </label>
      </div>

      <label className="mt-4 flex items-start gap-2.5">
        <input
          type="checkbox"
          checked={answered}
          onChange={(e) => setAnswered(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--brand-pink,#ec4899)]"
        />
        <span className="text-xs leading-relaxed text-muted">
          You have already spoken to them. Leave this ticked for anything you are typing up
          afterwards — it keeps your reply time honest instead of counting the gap before you
          got round to writing it down.
        </span>
      </label>

      {error && <p className="mt-3 text-xs font-medium text-red-500">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="brand-gradient-bg rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Saving…" : "Add it"}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError("");
          }}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted hover:text-foreground"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

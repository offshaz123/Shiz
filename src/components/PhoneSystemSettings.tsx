"use client";

import { useActionState } from "react";
import Link from "next/link";
import { savePbxId, saveNumbers } from "@/app/admin/settings/actions";
import type { StaffFormState } from "@/app/admin/staff/actions";

/**
 * The phone system's own settings: one account number and two numbers.
 *
 * Both of these are the company's, not a person's. They were nested
 * inside the owner's own extension box on the Team page, which meant the
 * heading above them said the opposite of what they are.
 */

/** What is actually saved against a box, said plainly under it.
 *
 *  The boxes have realistic-looking placeholders, and a placeholder that
 *  looks like a real value reads as a saved value — somebody saved a
 *  screen of empty boxes believing they held what they could see, and
 *  cleared the numbers. */
function Saved({ value, blank }: { value: string; blank: string }) {
  return (
    <span className="mt-1 block text-[11px] text-muted">
      {value ? (
        <>
          Saved: <span className="font-semibold tabular-nums text-foreground">{value}</span>
        </>
      ) : (
        <span className="text-amber-500">{blank}</span>
      )}
    </span>
  );
}

function AccountNumber({ current }: { current: string }) {
  const [state, action, saving] = useActionState<StaffFormState, FormData>(savePbxId, {});

  return (
    <section id="account" className="scroll-mt-6 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-bold text-foreground">Phone system account number</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        The number in front of everybody&apos;s extension when they sign into the calling app —
        the <span className="tabular-nums">123456</span> in{" "}
        <span className="tabular-nums">123456-101</span>. It is on the Zadarma panel next to the
        extensions. Set it once and the{" "}
        <Link href="/admin/phone" className="underline hover:text-foreground">
          phone setup page
        </Link>{" "}
        shows each person their own full login.
      </p>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs text-muted">
          Account number
          <input
            name="pbxId"
            defaultValue={current}
            inputMode="numeric"
            placeholder="e.g. 123456"
            className="mt-1.5 block w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <Saved value={current} blank="Not set — nobody can sign the calling app in" />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-brand-pink px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {state.error && <span className="text-xs text-red-400">{state.error}</span>}
        {state.ok && <span className="text-xs text-emerald-400">{state.ok}</span>}
      </form>
    </section>
  );
}

function OurNumbers({ uk, us }: { uk: string; us: string }) {
  const [state, action, saving] = useActionState<StaffFormState, FormData>(saveNumbers, {});

  return (
    <section id="numbers" className="scroll-mt-6 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-bold text-foreground">The number businesses see</h2>
      <p className="mt-1 text-xs leading-relaxed text-muted">
        Picked by the country the business is in, and set on the caller&apos;s extension as the
        call is placed. Leave one empty and calls to that country go out on whatever the
        extension is already set to.
      </p>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs text-muted">
          United Kingdom
          <input
            name="ukNumber"
            defaultValue={uk}
            inputMode="tel"
            placeholder="e.g. +44…"
            className="mt-1.5 block w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <Saved value={uk} blank="Not set — the extension decides" />
        </label>
        <label className="text-xs text-muted">
          United States
          <input
            name="usNumber"
            defaultValue={us}
            inputMode="tel"
            placeholder="e.g. +1…"
            className="mt-1.5 block w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <Saved value={us} blank="Not set — the extension decides" />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg border border-brand-pink px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        {state.error && <span className="text-xs text-red-400">{state.error}</span>}
        {state.ok && <span className="text-xs text-emerald-400">{state.ok}</span>}
      </form>
      <p className="mt-2 text-[11px] leading-relaxed text-muted">
        A number only works once the phone system says it is active — while one is still in
        process, leave it out. Each person can see what their own calls show on the{" "}
        <Link href="/admin/phone" className="underline hover:text-foreground">
          phone setup page
        </Link>
        , read from the phone system itself.
      </p>
    </section>
  );
}

export function PhoneSystemSettings({
  pbxId,
  ukNumber,
  usNumber,
}: {
  pbxId: string;
  ukNumber: string;
  usNumber: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <AccountNumber current={pbxId} />
      <OurNumbers uk={ukNumber} us={usNumber} />
    </div>
  );
}

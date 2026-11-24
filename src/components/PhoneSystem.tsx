"use client";

import { useActionState } from "react";
import { connectPhoneSystem, type PhoneState } from "@/app/admin/health/actions";

/** The form passes nothing, so the action takes nothing. */
async function connect(): Promise<PhoneState> {
  return connectPhoneSystem();
}

/**
 * Pointing the phone system at us, from a button.
 *
 * Rather than typing the address into Zadarma's control panel by hand,
 * because the URL has to match exactly, their setup check posts to it
 * before it will save, and getting it wrong fails silently — the webhook
 * simply never arrives and the first anybody knows is an empty call log
 * a fortnight later.
 */
export function PhoneSystem({
  connected,
  webhookUrl,
  current,
}: {
  /** Whether there are API keys on the server at all. */
  connected: boolean;
  /** The address it should be posting to. */
  webhookUrl: string;
  /** What it says it is posting to now, or null if it could not be asked. */
  current: { url: string; events: string[] } | null;
}) {
  const [state, action, pending] = useActionState<PhoneState, FormData>(connect, {});

  const pointed = current?.url === webhookUrl;

  return (
    <section className="mt-8 rounded-2xl border border-border bg-surface p-5">
      <h2 className="text-sm font-bold text-foreground">Phone system</h2>

      {!connected ? (
        <p className="mt-2 text-sm leading-relaxed text-muted">
          No API key on the server yet. Generate one at{" "}
          <span className="text-foreground">my.zadarma.com/api/</span>, then add{" "}
          <code className="text-foreground">ZADARMA_KEY</code> and{" "}
          <code className="text-foreground">ZADARMA_SECRET</code> in hPanel under Environment
          variables and redeploy. Nothing here works until both are set.
        </p>
      ) : (
        <>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {pointed
              ? "Connected. Every outgoing call now writes itself into the call log when it ends."
              : current === null
                ? "The keys are set, but the phone system did not answer when asked what it is pointed at. Either the keys are wrong or it is having a moment."
                : "The keys are set, but it is not pointed at us yet. Press connect."}
          </p>

          <p className="mt-3 text-[11px] text-muted">
            It should post to <code className="text-foreground">{webhookUrl}</code>
            {current?.url ? (
              <>
                <br />
                It currently posts to{" "}
                <code className="text-foreground">{current.url || "nowhere"}</code>
                {current.events.length > 0 && <> · events: {current.events.join(", ")}</>}
              </>
            ) : null}
          </p>

          <form action={action} className="mt-4">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg border border-brand-pink px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
            >
              {pending ? "Connecting…" : pointed ? "Connect again" : "Connect the phone system"}
            </button>
          </form>

          {state.error && (
            <p className="mt-3 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-2.5 text-sm text-foreground">
              {state.error}
            </p>
          )}
          {state.ok && <p className="mt-3 text-sm font-semibold text-emerald-500">{state.ok}</p>}
        </>
      )}
    </section>
  );
}

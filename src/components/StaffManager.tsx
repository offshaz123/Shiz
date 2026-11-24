"use client";

import { useActionState, useState } from "react";
import {
  createStaff,
  resetPassword,
  saveOwnerExtension,
  toggleActive,
  updatePages,
  type StaffFormState,
} from "@/app/admin/staff/actions";
import { grantablePages } from "@/lib/admin-pages";
import { REGIONS, REGION_INFO } from "@/lib/regions";
import type { Staff, StaffTally, Activity, Sitting, DayReport } from "@/lib/staff";
import { DayCalendar } from "./DayCalendar";
import { WorkDayLine } from "./WorkDayLine";

/**
 * The team screen: who can sign in, what each of them can open, and what
 * they have actually been doing.
 *
 * The three are on one page deliberately. An account without a record of
 * what it did is a key with no lock on the door behind it, and a record
 * nobody reads is a record that may as well not exist — so the numbers sit
 * on the same row as the switches.
 */

function ago(when: string | null): string {
  if (!when) return "never";
  const then = new Date(when.replace(" ", "T")).getTime();
  if (Number.isNaN(then)) return when;
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function clock(when: string | null): string {
  if (!when) return "";
  return when.slice(11, 16);
}

const ACTION_WORDS: Record<string, string> = {
  "signed-in": "signed in",
  "signed-out": "signed out",
  "logged-call": "logged a call",
  "set-status": "set the status",
  "wrote-note": "wrote a note",
  "fixed-email": "corrected an email address",
  "sent-email": "sent an email",
  "changed-client": "changed a client account",
  "added-client": "added a client",
  "added-staff": "added someone to the team",
  "changed-access": "changed what someone can see",
  "enabled-staff": "switched an account on",
  "disabled-staff": "switched an account off",
  "reset-staff-password": "reset someone's password",
  "set-own-extension": "set their own extension",
  "wrote-up-call": "wrote up a call",
  dialled: "rang a business",
  "deleted-business": "moved a business to Deleted",
  "restored-business": "put a business back on the list",
};

function hoursAndMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/**
 * The owner's own extension, in a box, on the same screen as everyone
 * else's.
 *
 * It was a setting on the server before this, which made it the one
 * extension on the system that could not be changed from the system —
 * and the asymmetry was noticed immediately: "why do I need to put the
 * variable for myself but don't put it for them?" No good answer, so it
 * is a box now.
 */
function YourExtension({ current }: { current: string }) {
  const [state, action, saving] = useActionState<StaffFormState, FormData>(
    saveOwnerExtension,
    {},
  );

  return (
    <section className="rounded-2xl border border-border bg-surface p-4">
      <h2 className="text-sm font-bold text-foreground">Your own extension</h2>
      <p className="mt-1 text-xs text-muted">
        Yours in the phone system, the same as everybody else&apos;s below. This is the one the
        Call button on Who to call rings first, so without it the button stays hidden for you.
      </p>
      <form action={action} className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs text-muted">
          Extension
          <input
            name="extension"
            defaultValue={current}
            inputMode="numeric"
            placeholder="100"
            className="mt-1.5 block w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
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

export function StaffManager({
  staff,
  tallies,
  activity,
  sittings,
  days,
  ownerExtension,
}: {
  staff: Staff[];
  tallies: StaffTally[];
  activity: Activity[];
  sittings: Sitting[];
  /** A month of days per person, keyed by staff id. */
  days: Record<string, DayReport[]>;
  /** The owner's own extension, set on this page rather than on the server. */
  ownerExtension: string;
}) {
  const [addState, addAction, adding] = useActionState<StaffFormState, FormData>(createStaff, {});
  const [open, setOpen] = useState<number | null>(null);
  const pages = grantablePages();

  const tallyFor = (id: number | null) => tallies.find((t) => t.staffId === id);

  return (
    <div className="flex flex-col gap-10">
      <YourExtension current={ownerExtension} />

      <section id="people" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">Who can sign in</h2>
        <p className="mt-1 text-xs text-muted">
          You sign in with the main password and no name, and you always see everything. The
          people below sign in with their own name and password.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {staff.length === 0 && (
            <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              Nobody yet. Add somebody below and they can start on the call list.
            </p>
          )}

          {staff.map((person) => {
            const tally = tallyFor(person.id);
            const expanded = open === person.id;
            return (
              <div
                key={person.id}
                className={`rounded-2xl border bg-surface p-4 ${
                  person.active ? "border-border" : "border-border/60 opacity-70"
                }`}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <button
                    type="button"
                    onClick={() => setOpen(expanded ? null : person.id)}
                    className="text-sm font-bold text-foreground underline-offset-4 hover:underline"
                  >
                    {person.name}
                  </button>
                  <span className="text-xs text-muted">signs in as {person.username}</span>
                  {!person.active && (
                    <span className="rounded-full border border-red-500/50 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      switched off
                    </span>
                  )}

                  {/* The facts, and only the facts. No score: whether this
                      is a good day depends on what the day was for, and a
                      number here pretending to know that would be wrong
                      about somebody sooner or later. */}
                  <span className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                    <span>
                      <b className="text-foreground tabular-nums">{tally?.callsToday ?? 0}</b> calls
                      logged today
                    </span>
                    <span>
                      <b className="text-foreground tabular-nums">{tally?.today ?? 0}</b> actions
                      today
                    </span>
                    <span>
                      <b className="text-foreground tabular-nums">{tally?.week ?? 0}</b> this week
                    </span>
                    <span>last seen {ago(tally?.lastAt ?? person.lastSeenAt)}</span>
                  </span>
                </div>

                {tally?.firstTodayAt && (
                  <p className="mt-2 text-xs text-muted">
                    Today: first thing at {clock(tally.firstTodayAt)}, last at{" "}
                    {clock(tally.lastAt)}.
                  </p>
                )}

                <p className="mt-2 text-xs text-muted">
                  {person.extension ? `Extension ${person.extension} · ` : "No extension · "}
                  Lists:{" "}
                  <span className="text-foreground">
                    {person.regions.map((r) => REGION_INFO[r].label).join(" and ")}
                  </span>
                </p>

                <p className="mt-1 text-xs text-muted">
                  Can open:{" "}
                  <span className="text-foreground">
                    {person.pages.length === 0
                      ? "nothing"
                      : pages
                          .filter((p) => person.pages.includes(p.key))
                          .map((p) => p.label)
                          .join(", ")}
                  </span>
                </p>

                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : person.id)}
                  className="mt-3 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
                >
                  {expanded ? "Close" : `Open ${person.name}'s profile`}
                </button>

                {expanded && (
                  <PersonPanel
                    person={person}
                    activity={activity}
                    sittings={sittings}
                    days={days[String(person.id)] ?? []}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section id="add" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">Add somebody</h2>
        <form action={addAction} className="mt-3 flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">
            Their name
            <input
              name="name"
              required
              className="mt-1.5 block w-48 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted">
            Sign-in name
            <input
              name="username"
              required
              autoComplete="off"
              className="mt-1.5 block w-40 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <label className="text-xs text-muted">
            Password (ten characters or more)
            <input
              name="password"
              type="text"
              required
              autoComplete="off"
              className="mt-1.5 block w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <button
            type="submit"
            disabled={adding}
            className="brand-gradient-bg rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {adding ? "Adding…" : "Add"}
          </button>
        </form>
        {/* Shown as text rather than hidden behind dots: you have to read it
            out to them once, and it is never recoverable afterwards. */}
        <p className="mt-2 text-xs text-muted">
          Pick the password yourself and tell them. It is stored scrambled, so nobody — including
          you — can read it back later. You can always set a new one.
        </p>
        {addState.error && (
          <p className="mt-2 rounded-xl border border-red-500/40 bg-red-500/5 px-4 py-2.5 text-sm text-foreground">
            {addState.error}
          </p>
        )}
        {addState.ok && (
          <p className="mt-2 text-sm font-semibold text-emerald-500">{addState.ok}</p>
        )}
      </section>

      <section id="sittings" className="scroll-mt-6">
        <h2 className="text-sm font-bold text-foreground">Signed in and signed out</h2>
        <p className="mt-1 text-xs text-muted">
          When each sitting started, when it ended, and how long it ran. Measured to the last
          thing they actually did, not to the moment the tab was finally closed — a browser left
          open overnight is not a night&apos;s work.
        </p>
        <ul className="mt-4 flex flex-col gap-1.5">
          {sittings.length === 0 && (
            <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              Nothing yet. This starts filling the next time somebody signs in.
            </li>
          )}
          {sittings.map((sit) => (
            <li
              key={sit.id}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs"
            >
              <span className="font-semibold text-foreground">{sit.who}</span>
              <span className="tabular-nums text-muted">
                {sit.startedAt.slice(5, 16).replace("-", "/")}
              </span>
              <span className="text-muted">
                {sit.open ? (
                  <span className="font-semibold text-emerald-500">still signed in</span>
                ) : (
                  <>
                    until {sit.endedAt?.slice(11, 16)}
                    {sit.endedReason === "left" && " (closed the tab)"}
                  </>
                )}
              </span>
              <span className="ml-auto font-semibold tabular-nums text-foreground">
                {hoursAndMinutes(sit.minutes)}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section id="log" className="scroll-mt-6">
        {/* Folded away by default.
            It is the longest thing on the page by a distance and the
            least often wanted: what somebody actually opens this page
            for is one person's day, which is now on their own panel.
            Left open, it made the page look like a log file. */}
        <details className="group">
          <summary className="flex cursor-pointer list-none items-baseline gap-2">
            <h2 className="text-sm font-bold text-foreground">Everything that has happened</h2>
            <span className="text-xs text-muted">
              {activity.length} {activity.length === 1 ? "entry" : "entries"}
            </span>
            <span className="text-xs text-muted group-open:hidden">— show</span>
            <span className="hidden text-xs text-muted group-open:inline">— hide</span>
          </summary>
          <p className="mt-1 text-xs text-muted">
            Newest first, everybody including you. This is a record of what was done and when, not
            a judgement about it.
          </p>
          <ul className="mt-4 flex flex-col gap-1.5">
          {activity.length === 0 && (
            <li className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
              Nothing recorded yet.
            </li>
          )}
          {activity.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs"
            >
              <span className="font-semibold text-foreground">{row.who}</span>
              <span className="text-muted">{ACTION_WORDS[row.action] ?? row.action}</span>
              {row.subject && <span className="font-semibold text-foreground">{row.subject}</span>}
              {row.detail && <span className="text-muted">— {row.detail}</span>}
              <span className="ml-auto tabular-nums text-muted" title={row.at}>
                {row.at.slice(5, 16).replace("-", "/")}
              </span>
            </li>
          ))}
          </ul>
        </details>
      </section>
    </div>
  );
}

/** The switches and the password reset for one person. */
function PersonPanel({
  person,
  activity,
  sittings,
  days,
}: {
  person: Staff;
  activity: Activity[];
  sittings: Sitting[];
  days: DayReport[];
}) {
  const [resetState, resetAction, resetting] = useActionState<StaffFormState, FormData>(
    resetPassword,
    {},
  );
  const pages = grantablePages();
  // Everything of theirs, not the last twelve: the day line needs the
  // whole day, and twelve rows is an hour of a busy morning.
  const theirs = activity.filter((a) => a.staffId === person.id);
  const theirSittings = sittings.filter((sit) => sit.staffId === person.id);

  // Every day they have anything on, newest first.
  const dates = [
    ...new Set([
      ...theirSittings.map((sit) => sit.startedAt.slice(0, 10)),
      ...theirs.map((a) => a.at.slice(0, 10)),
    ]),
  ]
    .filter(Boolean)
    .sort()
    .reverse();

  return (
    <div className="mt-4 border-t border-border pt-4">
      <form action={updatePages}>
        <input type="hidden" name="id" value={person.id} />
        <div className="flex flex-col gap-2">
          {pages.map((page) => (
            <label key={page.key} className="flex items-start gap-2.5 text-sm">
              <input
                type="checkbox"
                name={`page-${page.key}`}
                defaultChecked={person.pages.includes(page.key)}
                className="mt-0.5 h-4 w-4 accent-[var(--brand-pink,#ec4899)]"
              />
              <span>
                <span className="font-semibold text-foreground">{page.label}</span>
                <span className="block text-[11px] text-muted">{page.hint}</span>
              </span>
            </label>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-muted">
          Switching a page off hides it from them and blocks the address, even if they type it in.
          Nothing is deleted and nothing changes for you.
        </p>

        <div className="mt-4 border-t border-border pt-4">
          <label className="text-xs text-muted">
            Phone extension
            <input
              name="extension"
              defaultValue={person.extension}
              inputMode="numeric"
              placeholder="100"
              className="mt-1.5 block w-28 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <p className="mt-1.5 text-[11px] text-muted">
            Their extension in the phone system. This is what attaches a call to them — without
            it their calls are logged against the business but not against a person, and the Call
            button on Who to call stays hidden for them.
          </p>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold text-foreground">Which lists they work</p>
          <div className="mt-2 flex flex-wrap gap-4">
            {REGIONS.map((key) => (
              <label key={key} className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  name={`region-${key}`}
                  defaultChecked={person.regions.includes(key)}
                  className="h-4 w-4 accent-[var(--brand-pink,#ec4899)]"
                />
                {REGION_INFO[key].name}
              </label>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-muted">
            Only the lists ticked here show up on Who to call for them, and the other country&apos;s
            businesses are not returned even if they go looking for the address.
          </p>
        </div>
        <button
          type="submit"
          className="mt-3 rounded-lg border border-brand-pink px-4 py-2 text-xs font-semibold text-foreground"
        >
          Save what they can see
        </button>
      </form>

      <form action={toggleActive} className="mt-4 flex items-center gap-3">
        <input type="hidden" name="id" value={person.id} />
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            name="active"
            defaultChecked={person.active}
            className="h-4 w-4 accent-[var(--brand-pink,#ec4899)]"
          />
          Can sign in
        </label>
        <button
          type="submit"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Save
        </button>
        <span className="text-[11px] text-muted">
          Switching this off ends their session the next time they load a page.
        </span>
      </form>

      <form action={resetAction} className="mt-4 flex flex-wrap items-end gap-2">
        <input type="hidden" name="id" value={person.id} />
        <label className="text-xs text-muted">
          New password
          <input
            name="password"
            type="text"
            autoComplete="off"
            className="mt-1.5 block w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </label>
        <button
          type="submit"
          disabled={resetting}
          className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-muted hover:text-foreground disabled:opacity-50"
        >
          {resetting ? "Saving…" : "Set it"}
        </button>
        {resetState.error && <span className="text-xs text-foreground">{resetState.error}</span>}
        {resetState.ok && <span className="text-xs text-emerald-500">{resetState.ok}</span>}
      </form>

      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold text-foreground">Day by day</p>
        <p className="mt-1 text-[11px] text-muted">
          Press a date to see what happened on it.
        </p>
        <div className="mt-3">
          <DayCalendar days={days} />
        </div>
      </div>

      {/* Their day, read top to bottom: when they signed in, what they
          did, and the stretches with nothing in them. This replaced a
          flat list of their last few actions, which said what happened
          without ever saying what a day looked like. */}
      <div className="mt-5 border-t border-border pt-4">
        <p className="text-xs font-semibold text-foreground">What they did, day by day</p>
        <p className="mt-1 text-[11px] text-muted">
          Pick a date. Signing in and out, every action with a time against it, and any stretch
          with nothing recorded in it.
        </p>
        <div className="mt-3">
          <WorkDayLine sittings={theirSittings} moments={theirs} dates={dates} />
        </div>
      </div>
    </div>
  );
}

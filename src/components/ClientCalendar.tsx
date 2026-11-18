"use client";

import { useCallback, useEffect, useState } from "react";
import type { Booking } from "@/lib/bookings";

/**
 * The client's diary, as a month they can actually work from.
 *
 * Built as a grid rather than a list because a week with three jobs on
 * Tuesday and nothing on Wednesday is a fact you see instantly in a grid
 * and have to work out from a list.
 *
 * Phone first. Most of these are tradespeople who will open this standing
 * next to a van, so the grid collapses to a readable week-by-week column on
 * a narrow screen, the tap targets are large, and adding a job is four
 * fields with everything else optional.
 */

const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const STATUS_LABEL: Record<string, string> = {
  booked: "Booked",
  done: "Done",
  cancelled: "Cancelled",
  "no-show": "No show",
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dayKey(date: Date): string {
  return `${monthKey(date)}-${String(date.getDate()).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

/**
 * The cells of the grid: the days of the month, padded at the front so the
 * first lands under the right weekday. Monday-first, because that is how a
 * working week is read in the UK and getDay() counts from Sunday.
 */
function cellsFor(key: string): (Date | null)[] {
  const [y, m] = key.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const daysInMonth = new Date(y, m, 0).getDate();
  const lead = (first.getDay() + 6) % 7;

  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(y, m - 1, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const EMPTY = {
  customerName: "",
  phone: "",
  email: "",
  job: "",
  notes: "",
  startsAt: "",
  durationMinutes: "",
  price: "",
};

export function ClientCalendar() {
  const [month, setMonth] = useState(() => monthKey(new Date()));
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async (key: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/portal/bookings?month=${key}`);
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setBookings(data.bookings as Booking[]);
      setError("");
    } catch {
      setError("Could not load your diary. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/portal/bookings?month=${month}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (!cancelled) {
          setBookings(data.bookings as Booking[]);
          setError("");
        }
      })
      .catch(() => {
        if (!cancelled) setError("Could not load your diary. Try again in a moment.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const byDay = new Map<string, Booking[]>();
  for (const booking of bookings) {
    const list = byDay.get(booking.bookedOn);
    if (list) list.push(booking);
    else byDay.set(booking.bookedOn, [booking]);
  }

  function shift(by: number) {
    const [y, m] = month.split("-").map(Number);
    setMonth(monthKey(new Date(y, m - 1 + by, 1)));
    setSelected(null);
  }

  async function save() {
    if (!selected || !form.customerName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/portal/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, bookedOn: selected }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setForm({ ...EMPTY });
      await load(month);
    } catch {
      setError("That did not save. Write the details down before trying again.");
    } finally {
      setSaving(false);
    }
  }

  async function setStatus(id: number, status: string) {
    try {
      await fetch("/api/portal/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      await load(month);
    } catch {
      setError("That did not save.");
    }
  }

  const today = dayKey(new Date());
  const selectedJobs = selected ? (byDay.get(selected) ?? []) : [];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="Previous month"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground"
        >
          ←
        </button>
        <h2 className="text-base font-bold text-foreground">{monthLabel(month)}</h2>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="Next month"
          className="rounded-full border border-border px-4 py-2 text-sm font-semibold text-muted hover:text-foreground"
        >
          →
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-500/50 bg-red-500/5 px-4 py-2.5 text-sm text-foreground">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-border bg-surface p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-1">
          {DAY_NAMES.map((name) => (
            <div key={name} className="py-1.5 text-center text-[11px] font-semibold text-muted">
              {name}
            </div>
          ))}

          {cellsFor(month).map((date, i) => {
            if (!date) return <div key={`pad-${i}`} />;
            const key = dayKey(date);
            const jobs = byDay.get(key) ?? [];
            const live = jobs.filter((j) => j.status === "booked");
            const isToday = key === today;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(selected === key ? null : key)}
                aria-pressed={selected === key}
                className={`flex min-h-[3.75rem] flex-col items-center gap-1 rounded-xl border p-1.5 transition sm:min-h-[4.5rem] ${
                  selected === key
                    ? "border-brand-pink bg-brand-pink/10"
                    : isToday
                      ? "border-brand-pink/40 bg-background"
                      : "border-transparent bg-background hover:border-border"
                }`}
              >
                <span
                  className={`text-xs tabular-nums ${
                    isToday ? "font-bold text-brand-pink" : "text-foreground"
                  }`}
                >
                  {date.getDate()}
                </span>
                {live.length > 0 && (
                  <span className="rounded-full bg-series-1 px-1.5 text-[10px] font-bold tabular-nums text-white">
                    {live.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {loading && <p className="px-2 py-2 text-xs text-muted">Loading…</p>}
      </div>

      {selected && (
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-foreground">
            {new Date(`${selected}T12:00:00`).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </h3>

          {selectedJobs.length > 0 && (
            <ul className="mt-3 divide-y divide-border">
              {selectedJobs.map((job) => (
                <li key={job.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2.5">
                  {job.startsAt && (
                    <span className="text-sm font-bold tabular-nums text-foreground">
                      {job.startsAt}
                    </span>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      job.status === "booked" ? "text-foreground" : "text-muted line-through"
                    }`}
                  >
                    {job.customerName}
                  </span>
                  {job.job && <span className="text-xs text-muted">{job.job}</span>}
                  {job.phone && (
                    <a href={`tel:${job.phone}`} className="text-xs font-medium text-brand-pink">
                      {job.phone}
                    </a>
                  )}
                  {job.price !== null && (
                    <span className="text-xs tabular-nums text-muted">£{job.price}</span>
                  )}
                  <span className="ml-auto flex items-center gap-2 text-[11px]">
                    <span className="text-muted">{STATUS_LABEL[job.status] ?? job.status}</span>
                    {job.status === "booked" && (
                      <>
                        <button
                          type="button"
                          onClick={() => setStatus(job.id, "done")}
                          className="font-semibold text-foreground hover:underline"
                        >
                          Done
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(job.id, "cancelled")}
                          className="text-muted hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </span>
                  {job.notes && (
                    <p className="w-full text-xs leading-relaxed text-muted">{job.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-semibold text-muted">Add a job</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <input
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Customer name"
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
              />
              <input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Phone"
                inputMode="tel"
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
              />
              <input
                value={form.job}
                onChange={(e) => setForm({ ...form, job: e.target.value })}
                placeholder="What is the job?"
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="time"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                />
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="Price £"
                  inputMode="decimal"
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground"
                />
              </div>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Anything worth remembering — address, what they drive, what they said."
                rows={2}
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground sm:col-span-2"
              />
            </div>

            <button
              type="button"
              onClick={save}
              disabled={saving || !form.customerName.trim()}
              className="brand-gradient-bg mt-3 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Saving…" : "Add to the diary"}
            </button>
          </div>
        </section>
      )}

      {!selected && (
        <p className="text-xs text-muted">Tap a day to see what is on and add a job.</p>
      )}
    </div>
  );
}

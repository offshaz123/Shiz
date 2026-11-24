import Link from "next/link";
import type { Callback, DiaryDay } from "@/lib/callbacks";
import { REGION_INFO } from "@/lib/regions";

/**
 * The diary of promised callbacks.
 *
 * Grouped by day with the time against each one, because that is how
 * the promise was made: "ring me Thursday morning" is kept or broken
 * by the morning, not by the Thursday. Missed ones sit at the top in
 * their own block rather than under a heading three weeks back that
 * nobody scrolls to.
 */

function Row({ call }: { call: Callback }) {
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-3.5 py-2.5">
      <span className="w-12 shrink-0 font-bold tabular-nums text-foreground">{call.time}</span>
      <Link
        href={`/admin/prospects/${call.prospectId}`}
        className="font-semibold text-foreground underline-offset-2 hover:underline"
      >
        {call.business}
      </Link>
      {call.phone && <span className="tabular-nums text-xs text-muted">{call.phone}</span>}
      <span className="text-[11px] text-muted">{REGION_INFO[call.region].name}</span>
      {call.promisedBy && (
        <span className="text-[11px] text-muted">promised by {call.promisedBy}</span>
      )}
      {call.notes && (
        <span className="w-full text-xs leading-relaxed text-muted">
          Last time: {call.notes.length > 180 ? `${call.notes.slice(0, 179)}…` : call.notes}
        </span>
      )}
    </li>
  );
}

export function CallbackDiary({
  missed,
  days,
}: {
  missed: Callback[];
  days: DiaryDay[];
}) {
  const total = missed.length + days.reduce((n, d) => n + d.calls.length, 0);

  if (total === 0) {
    return (
      <p className="rounded-2xl border border-border bg-surface px-4 py-3.5 text-sm text-muted">
        Nobody is waiting on a call back. When somebody asks to be rung at a particular time, it
        appears here on the day they asked for.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {missed.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-red-400">
            Missed — {missed.length} {missed.length === 1 ? "promise" : "promises"} already gone by
          </h3>
          <p className="mt-1 text-xs text-muted">
            The time they asked for has been and gone. Ring them and say so, rather than leaving it.
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {missed.map((call) => (
              <Row key={`${call.prospectId}-${call.at}`} call={call} />
            ))}
          </ul>
        </div>
      )}

      {days.map((day) => (
        <div key={day.day}>
          <h3 className="text-xs font-bold uppercase tracking-wide text-foreground">
            {day.label}
            <span className="ml-2 font-normal text-muted">
              {day.calls.length} {day.calls.length === 1 ? "call" : "calls"}
            </span>
          </h3>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {day.calls.map((call) => (
              <Row key={`${call.prospectId}-${call.at}`} call={call} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

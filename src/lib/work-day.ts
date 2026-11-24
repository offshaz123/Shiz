/**
 * One person's day, as a line you can read.
 *
 * The team page had the facts already — when each sitting started,
 * when it ended, every action with a time against it — but as two long
 * lists on the same screen, which answers "what happened" and not
 * "what did he do today". Walid asked the second question, and the
 * honest answer has three parts: when he was signed in, what he did
 * while he was, and the stretches in between where nothing happened.
 *
 * That last one is the part worth having and the part worth being
 * careful about. A gap is not proof of anything — somebody on a long
 * call with a difficult business is doing the most valuable work of
 * the day and touching nothing — so this reports the gap and its
 * length and stops there. It does not call it idle, and it does not
 * add it up into a score.
 *
 * No imports: the page that draws this is a client component.
 */

export type Moment = { at: string; action: string; subject: string; detail: string };

export type Stretch =
  | { kind: "signed-in"; at: string }
  | { kind: "did"; at: string; action: string; subject: string; detail: string }
  | { kind: "quiet"; from: string; to: string; minutes: number }
  | { kind: "signed-out"; at: string; reason: string }
  | { kind: "still-in"; at: string };

export type WorkDay = {
  /** YYYY-MM-DD. */
  date: string;
  /** When the first thing happened, "09:14". */
  from: string;
  /** The last, "17:02". */
  to: string;
  /** Minutes between the two. */
  span: number;
  /** How many things they did. */
  actions: number;
  /** The stretches with nothing in them, longest first. */
  quiet: { from: string; to: string; minutes: number }[];
  /** The whole day in order. */
  line: Stretch[];
};

/** A stretch of nothing this long or longer is worth showing. */
export const QUIET_MINUTES = 20;

function clock(iso: string): string {
  return iso.slice(11, 16);
}

function minutesBetween(a: string, b: string): number {
  const from = new Date(a.replace(" ", "T")).getTime();
  const to = new Date(b.replace(" ", "T")).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.max(0, Math.round((to - from) / 60000));
}

type SittingLike = {
  startedAt: string;
  endedAt: string | null;
  lastSeenAt: string;
  endedReason: string;
  open: boolean;
};

/**
 * Builds the day from the sittings that started on it and everything
 * done during it.
 *
 * Both lists are expected newest-first, the way the database returns
 * them, and are put back into the order the day happened in.
 */
export function workDay(
  date: string,
  sittings: SittingLike[],
  moments: Moment[],
  quietMinutes = QUIET_MINUTES,
): WorkDay {
  const onDay = <T extends { at?: string; startedAt?: string }>(items: T[], key: "at" | "startedAt") =>
    items.filter((item) => String(item[key] ?? "").slice(0, 10) === date);

  const sat = onDay(sittings as unknown as { startedAt: string }[], "startedAt")
    .slice()
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt)) as unknown as SittingLike[];
  const did = onDay(moments, "at")
    .slice()
    .sort((a, b) => a.at.localeCompare(b.at));

  const line: Stretch[] = [];
  const quiet: { from: string; to: string; minutes: number }[] = [];

  for (const sitting of sat) {
    line.push({ kind: "signed-in", at: clock(sitting.startedAt) });

    const ends = sitting.endedAt ?? sitting.lastSeenAt;
    const inside = did.filter((m) => m.at >= sitting.startedAt && m.at <= ends);

    // Walk the sitting, looking at the space between one thing and the
    // next. The first space runs from signing in, which is where the
    // "signed in at nine and did nothing until ten" case lives.
    let previous = sitting.startedAt;
    for (const moment of inside) {
      const gap = minutesBetween(previous, moment.at);
      if (gap >= quietMinutes) {
        const stretch = { from: clock(previous), to: clock(moment.at), minutes: gap };
        quiet.push(stretch);
        line.push({ kind: "quiet", ...stretch });
      }
      line.push({
        kind: "did",
        at: clock(moment.at),
        action: moment.action,
        subject: moment.subject,
        detail: moment.detail,
      });
      previous = moment.at;
    }

    // And the space between the last thing and signing out.
    const tail = minutesBetween(previous, ends);
    if (tail >= quietMinutes) {
      const stretch = { from: clock(previous), to: clock(ends), minutes: tail };
      quiet.push(stretch);
      line.push({ kind: "quiet", ...stretch });
    }

    if (sitting.open) line.push({ kind: "still-in", at: clock(ends) });
    else line.push({ kind: "signed-out", at: clock(ends), reason: sitting.endedReason });
  }

  const firstAt = sat[0]?.startedAt ?? did[0]?.at ?? "";
  const lastSitting = sat[sat.length - 1];
  const lastAt = lastSitting
    ? (lastSitting.endedAt ?? lastSitting.lastSeenAt)
    : (did[did.length - 1]?.at ?? "");

  return {
    date,
    from: firstAt ? clock(firstAt) : "",
    to: lastAt ? clock(lastAt) : "",
    span: firstAt && lastAt ? minutesBetween(firstAt, lastAt) : 0,
    actions: did.length,
    quiet: quiet.slice().sort((a, b) => b.minutes - a.minutes),
    line,
  };
}

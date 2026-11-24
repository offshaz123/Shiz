/**
 * When somebody asked to be rung back.
 *
 * "Call me back" is the most valuable thing said on these calls and
 * the easiest to lose: it used to be a date with no time, which turns
 * "ring me at half nine before we open" into "some time on Thursday",
 * and a callback kept on the wrong side of lunch is a callback missed.
 *
 * So the outcome that says they want ringing back cannot be saved
 * without a day and a time. No imports, because the same rule has to
 * hold in the browser, where the box is, and on the server, where the
 * request lands.
 */

/** What the form sends: "2026-11-25" and "09:30". */
export type CallbackInput = { date: string; time: string };

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Why this callback will not do, or null when it is fine. */
export function callbackProblem(
  outcome: string,
  { date, time }: CallbackInput,
  now = new Date(),
): string | null {
  if (outcome !== "call-back") return null;

  if (!DATE.test(date)) return "Put the day they asked to be rung back on.";
  if (!TIME.test(time)) return "Put the time as well — a day on its own gets missed.";

  // Today is allowed, yesterday is not: a callback in the past is
  // somebody typing the wrong year, and saving it quietly would hide
  // the promise rather than keep it.
  const when = new Date(`${date}T${time}:00`);
  if (Number.isNaN(when.getTime())) return "That date and time do not make sense together.";

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  if (when < todayStart) return "That is in the past. Pick the day they actually asked for.";

  return null;
}

/** The two boxes as one value for the database: "2026-11-25 09:30:00". */
export function callbackValue({ date, time }: CallbackInput): string {
  if (!DATE.test(date)) return "";
  return `${date} ${TIME.test(time) ? time : "09:00"}:00`;
}

/** How it reads on a screen: "Thu 25 Nov, 9:30am". */
export function callbackWords(value: string): string {
  const when = new Date(value.replace(" ", "T"));
  if (Number.isNaN(when.getTime())) return value;
  return when.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

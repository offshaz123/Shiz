import { execute } from "./db";
import { sendToShop } from "./mail";
import { changeDay, money, styles, upcomingPrice } from "./plates";

const DAY = 24 * 60 * 60 * 1000;

// Price rises coming up (scheduled in Admin → Prices), soonest first.
export function upcomingRises(now = Date.now()) {
  return styles
    .flatMap((s) => {
      const next = upcomingPrice(s.id, now);
      return next ? [{ style: s, next, line: `${s.name}: ${money(s.pair)} → ${money(next.pair)} a pair (single ${money(s.single)} → ${money(next.single)}) on ${changeDay(next.startsAt)}` }] : [];
    })
    .sort((a, b) => a.next.startsAt - b.next.startsAt);
}

// Days until the next price rise, or null if none is scheduled.
export function daysUntilPriceRise(now = Date.now()) {
  const first = upcomingRises(now)[0];
  return first ? Math.ceil((first.next.startsAt - now) / DAY) : null;
}

// One email to the shop 4 days before prices go up. Checked by the
// half-hourly timer; INSERT IGNORE makes sure each rise is only mentioned once.
export async function maybeSendPriceRiseReminder(now = Date.now()) {
  const rises = upcomingRises(now).filter((r) => r.next.startsAt - now <= 4 * DAY);
  if (!rises.length) return;
  const key = `rise${new Date(rises[0].next.startsAt).toISOString().slice(2, 10).replace(/-/g, "")}`;
  const res = await execute("INSERT IGNORE INTO weekly_reports (week) VALUES (?)", [key]);
  if (res.affectedRows !== 1) return;
  const lines = rises.map((r) => r.line);
  await sendToShop({
    subject: `Reminder: prices go up on ${changeDay(rises[0].next.startsAt)}`,
    text: [
      "These prices go up automatically at midnight:",
      "",
      ...lines.map((l) => `- ${l}`),
      "",
      "The website has been telling customers these dates, so they need to go up as planned. You can see them in Admin → Prices.",
    ].join("\n"),
    html: `<p>These prices go up automatically at midnight:</p>
<ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
<p>The website has been telling customers these dates, so they need to go up as planned. You can see them in Admin → Prices.</p>`,
  });
}

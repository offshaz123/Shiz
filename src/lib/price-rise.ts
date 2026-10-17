import { execute } from "./db";
import { sendToShop } from "./mail";
import { PRICE_RISE, money, styles } from "./plates";

const DAY = 24 * 60 * 60 * 1000;

// The launch prices ending: which styles go up, from what to what.
export function priceRiseSummary() {
  return styles.flatMap((s) => {
    const next = PRICE_RISE.prices[s.id];
    return next ? [`${s.name}: ${money(s.pair)} → ${money(next.pair)} a pair (single ${money(s.single)} → ${money(next.single)})`] : [];
  });
}

// Days until the launch prices end (shown on the admin dashboard in the last week).
export function daysUntilPriceRise(now = new Date()) {
  const left = PRICE_RISE.at.getTime() - now.getTime();
  return left > 0 ? Math.ceil(left / DAY) : null;
}

// One email to the shop 4 days before the prices go up. Checked by the same
// timer as the Monday report; INSERT IGNORE makes sure it's only sent once.
export async function maybeSendPriceRiseReminder(now = new Date()) {
  const days = daysUntilPriceRise(now);
  if (days === null || days > 4) return;
  const res = await execute("INSERT IGNORE INTO weekly_reports (week) VALUES (?)", ["price-rise"]);
  if (res.affectedRows !== 1) return;
  const lines = priceRiseSummary();
  await sendToShop({
    subject: `Reminder: launch prices go up on ${PRICE_RISE.label}`,
    text: [
      `Your launch prices end soon. On ${PRICE_RISE.label} (midnight) these go up automatically:`,
      "",
      ...lines.map((l) => `- ${l}`),
      "",
      "The website has been telling customers this date, so the prices need to go up as planned.",
      "If you want different new prices, let Claude know before then.",
    ].join("\n"),
    html: `<p>Your launch prices end soon. On <b>${PRICE_RISE.label}</b> (midnight) these go up automatically:</p>
<ul>${lines.map((l) => `<li>${l}</li>`).join("")}</ul>
<p>The website has been telling customers this date, so the prices need to go up as planned. If you want different new prices, let Claude know before then.</p>`,
  });
}

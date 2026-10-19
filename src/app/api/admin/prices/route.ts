import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { addPriceChange, cancelPriceChange } from "@/lib/prices";
import { type StyleId, styles } from "@/lib/plates";

const pence = (v: unknown) => {
  const n = Math.round(Number(v) * 100);
  return Number.isFinite(n) && n >= 100 && n <= 50000 ? n : null;
};

// Admin → Prices: change a style's price now or from a date, or cancel a
// change that hasn't started yet.
export async function POST(req: Request) {
  if (!(await isAdmin())) return Response.json({ error: "Please log in again." }, { status: 401 });
  const body = await req.json().catch(() => ({}));

  if (body.action === "cancel") {
    const ok = await cancelPriceChange(Number(body.id) || 0);
    revalidatePath("/", "layout");
    return ok ? Response.json({ message: "Cancelled" }) : Response.json({ error: "That change has already started, so it can't be cancelled." }, { status: 400 });
  }

  const style = styles.find((s) => s.id === body.style)?.id as StyleId | undefined;
  const pair = pence(body.pair);
  const single = pence(body.single);
  if (!style) return Response.json({ error: "Choose a plate style." }, { status: 400 });
  if (pair === null || single === null) return Response.json({ error: "Enter prices between £1 and £500." }, { status: 400 });

  // A date means midnight (UK time) at the start of that day; no date means now.
  let startsAt = Date.now();
  if (body.date) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(body.date));
    if (!m) return Response.json({ error: "That date isn't valid." }, { status: 400 });
    const utcMidnight = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    // Europe/London is UTC+1 in summer time: shift so it's midnight there.
    const londonHour = Number(new Date(utcMidnight).toLocaleString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }));
    startsAt = utcMidnight - londonHour * 60 * 60 * 1000;
    if (startsAt <= Date.now()) return Response.json({ error: "Choose a date from tomorrow onwards, or leave it empty to change the price now." }, { status: 400 });
  }
  await addPriceChange({ style, pair, single, startsAt });
  revalidatePath("/", "layout");
  return Response.json({ message: body.date ? "Price change scheduled" : "Price changed" });
}

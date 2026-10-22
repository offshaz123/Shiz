// Advert and analytics events (TikTok Pixel and Google tag), sent from the
// browser. The TikTok Pixel only exists once the visitor accepted cookies; the
// Google tag is always there, but sends cookie-free signals until they accept.

import { type CartItem, describe, unitPrice } from "./plates";
import { site } from "./site";
import { type SourceId, landingSource } from "./sources";

export const CONSENT_COOKIE = "pu-consent";

type Gtag = (...args: unknown[]) => void;
type Ttq = { track: (...args: unknown[]) => void; page: () => void };

function tags() {
  if (typeof window === "undefined") return { gtag: undefined, ttq: undefined };
  const w = window as unknown as { gtag?: Gtag; ttq?: Ttq };
  return { gtag: w.gtag, ttq: w.ttq };
}

export function readConsent(): "yes" | "no" | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)pu-consent=(yes|no)/);
  return m ? (m[1] as "yes" | "no") : null;
}

// The shop answers on both platedup.co.uk and www.platedup.co.uk; remember
// the choice for both, so accepting on one counts on the other.
function cookieDomain() {
  const base = new URL(site.url).hostname.replace(/^www\./, "");
  const host = window.location.hostname;
  return host === base || host.endsWith(`.${base}`) ? `; Domain=${base}` : "";
}

export function saveConsent(choice: "yes" | "no") {
  // Clear any older copy saved for this address only, so it can't hide the new choice.
  document.cookie = `${CONSENT_COOKIE}=; Max-Age=0; Path=/`;
  document.cookie = `${CONSENT_COOKIE}=${choice}; Max-Age=${60 * 60 * 24 * 365}; Path=/${cookieDomain()}; SameSite=Lax; Secure`;
  window.dispatchEvent(new Event(CONSENT_COOKIE));
}

// Keeps the TikTok click id (?ttclid=… on a TikTok ad's link) for 7 days, so
// the server can match the paid order to the ad. Only called after "Accept".
export function saveTikTokClick() {
  const id = new URLSearchParams(window.location.search).get("ttclid");
  if (id) document.cookie = `pu-ttclid=${encodeURIComponent(id.slice(0, 200))}; Max-Age=${60 * 60 * 24 * 7}; Path=/${cookieDomain()}; SameSite=Lax; Secure`;
}

// Where this visit came from, worked out once when the visitor lands (the
// address changes as they move around the shop). null if from another page of the shop.
let landing: SourceId | null | undefined;
export function visitSource() {
  if (landing === undefined) landing = landingSource(new URL(window.location.href), document.referrer, new URL(site.url).hostname);
  return landing;
}

// Remembers where the customer came from for 30 days, so their order shows
// it on Admin → Insights. Only called after "Accept". A later visit from
// somewhere else replaces it, but typing the address in doesn't.
export function saveSource() {
  const s = visitSource();
  if (!s || (s === "direct" && /(?:^|;\s*)pu-src=/.test(document.cookie))) return;
  document.cookie = `pu-src=${s}; Max-Age=${60 * 60 * 24 * 30}; Path=/${cookieDomain()}; SameSite=Lax; Secure`;
}

// Runs `send` once the tags have loaded (they load just after the page, so
// an event fired as a page opens would otherwise be lost). Gives up after
// 10 seconds.
export function whenTagsReady(send: () => void) {
  let tries = 0;
  const attempt = () => {
    const { gtag, ttq } = tags();
    if (gtag || ttq) send();
    else if (++tries < 40) timer = setTimeout(attempt, 250);
  };
  let timer = setTimeout(attempt, 0);
  return () => clearTimeout(timer);
}

const pounds = (pence: number) => Math.round(pence) / 100;

function ttContents(items: Pick<CartItem, "type" | "style" | "qty">[]) {
  return items.map((i) => ({ content_id: `${i.type}-${i.style}`, quantity: i.qty }));
}

function gaItems(items: CartItem[]) {
  return items.map((i) => ({
    item_id: `${i.type}-${i.style}`,
    item_name: describe(i),
    price: pounds(unitPrice(i)),
    quantity: i.qty,
  }));
}

export function trackViewBuilder() {
  return whenTagsReady(() => {
    const { gtag, ttq } = tags();
    ttq?.track("ViewContent", { content_id: "plate-builder", content_name: "Plate builder", content_type: "product" });
    gtag?.("event", "view_item", {
      items: [{ item_id: "plate-builder", item_name: "Plate builder" }],
    });
  });
}

export function trackAddToCart(item: CartItem) {
  const { gtag, ttq } = tags();
  const value = pounds(unitPrice(item) * item.qty);
  ttq?.track("AddToCart", { value, currency: "GBP", content_type: "product", contents: ttContents([item]) });
  gtag?.("event", "add_to_cart", {
    value,
    currency: "GBP",
    items: gaItems([item]),
  });
}

export function trackBeginCheckout(items: CartItem[], subtotal: number) {
  return whenTagsReady(() => {
    const { gtag, ttq } = tags();
    const value = pounds(subtotal);
    ttq?.track("InitiateCheckout", { value, currency: "GBP", content_type: "product", contents: ttContents(items) });
    gtag?.("event", "begin_checkout", {
      value,
      currency: "GBP",
      items: gaItems(items),
    });
  });
}

// `ref` is the order number. TikTok uses it to match this with the same
// purchase sent from the server, and Google to ignore repeats.
export function trackPurchase(p: {
  ref: string;
  value: number;
  items: Pick<CartItem, "type" | "style" | "qty">[];
  googleAdsSendTo: string;
}) {
  const { gtag, ttq } = tags();
  const value = pounds(p.value);
  // The same event_id as the server sends, so TikTok counts the order once.
  ttq?.track("CompletePayment", { value, currency: "GBP", content_type: "product", contents: ttContents(p.items) }, { event_id: p.ref });
  gtag?.("event", "purchase", {
    transaction_id: p.ref,
    value,
    currency: "GBP",
    items: p.items.map((i) => ({
      item_id: `${i.type}-${i.style}`,
      quantity: i.qty,
    })),
  });
  if (p.googleAdsSendTo)
    gtag?.("event", "conversion", {
      send_to: p.googleAdsSendTo,
      value,
      currency: "GBP",
      transaction_id: p.ref,
    });
}

export function trackLead(kind: string) {
  const { gtag, ttq } = tags();
  ttq?.track("SubmitForm", { content_name: kind });
  gtag?.("event", "generate_lead", { lead_source: kind });
}

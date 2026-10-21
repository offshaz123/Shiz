// Advert and analytics events (Meta Pixel and Google tag), sent from the
// browser. The Meta Pixel only exists once the visitor accepted cookies; the
// Google tag is always there, but sends cookie-free signals until they accept.

import { type CartItem, describe, unitPrice } from "./plates";
import { site } from "./site";

export const CONSENT_COOKIE = "pu-consent";

type Fbq = (...args: unknown[]) => void;
type Gtag = (...args: unknown[]) => void;

function tags() {
  if (typeof window === "undefined") return { fbq: undefined, gtag: undefined };
  const w = window as unknown as { fbq?: Fbq; gtag?: Gtag };
  return { fbq: w.fbq, gtag: w.gtag };
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

// Runs `send` once the tags have loaded (they load just after the page, so
// an event fired as a page opens would otherwise be lost). Gives up after
// 10 seconds.
export function whenTagsReady(send: () => void) {
  let tries = 0;
  const attempt = () => {
    const { fbq, gtag } = tags();
    if (fbq || gtag) send();
    else if (++tries < 40) timer = setTimeout(attempt, 250);
  };
  let timer = setTimeout(attempt, 0);
  return () => clearTimeout(timer);
}

const pounds = (pence: number) => Math.round(pence) / 100;

function contents(items: Pick<CartItem, "type" | "style" | "qty">[]) {
  return items.map((i) => ({ id: `${i.type}-${i.style}`, quantity: i.qty }));
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
    const { fbq, gtag } = tags();
    fbq?.("track", "ViewContent", {
      content_name: "Plate builder",
      content_type: "product",
    });
    gtag?.("event", "view_item", {
      items: [{ item_id: "plate-builder", item_name: "Plate builder" }],
    });
  });
}

export function trackAddToCart(item: CartItem) {
  const { fbq, gtag } = tags();
  const value = pounds(unitPrice(item) * item.qty);
  fbq?.("track", "AddToCart", {
    value,
    currency: "GBP",
    content_type: "product",
    contents: contents([item]),
  });
  gtag?.("event", "add_to_cart", {
    value,
    currency: "GBP",
    items: gaItems([item]),
  });
}

export function trackBeginCheckout(items: CartItem[], subtotal: number) {
  return whenTagsReady(() => {
    const { fbq, gtag } = tags();
    const value = pounds(subtotal);
    const num_items = items.reduce((n, i) => n + i.qty, 0);
    fbq?.("track", "InitiateCheckout", {
      value,
      currency: "GBP",
      num_items,
      content_type: "product",
      contents: contents(items),
    });
    gtag?.("event", "begin_checkout", {
      value,
      currency: "GBP",
      items: gaItems(items),
    });
  });
}

// `ref` is the order number. Meta uses it to match this with the same
// purchase sent from the server, and Google to ignore repeats.
export function trackPurchase(p: {
  ref: string;
  value: number;
  items: Pick<CartItem, "type" | "style" | "qty">[];
  googleAdsSendTo: string;
}) {
  const { fbq, gtag } = tags();
  const value = pounds(p.value);
  fbq?.(
    "track",
    "Purchase",
    {
      value,
      currency: "GBP",
      content_type: "product",
      contents: contents(p.items),
    },
    { eventID: p.ref },
  );
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
  const { fbq, gtag } = tags();
  fbq?.("track", "Lead", { content_name: kind });
  gtag?.("event", "generate_lead", { lead_source: kind });
}

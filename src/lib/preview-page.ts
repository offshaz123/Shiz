import type { Rebuilt } from "./site-rebuild";
import { siteConfig } from "./site-config";

/**
 * Their own website, rebuilt, as something they can look at.
 *
 * Written as a string of HTML rather than as a React component on purpose.
 * This page borrows the business's own colour, carries their own
 * photographs and is served on its own with nothing of ours around it,
 * which is a different job from every other page on this site.
 *
 * It has to beat what they already have. That is the whole bar, and the
 * first version did not clear it: Walid sent a few, looked at the sites
 * they went to, and found businesses whose own homepage opens with video
 * and movement being shown a tidy static page. "Not bad" is a losing
 * answer. So this one moves the whole way down, and it is a site rather
 * than a page: a working navigation, sections they do not currently have,
 * and a clear mark on every one of those saying we would add it.
 *
 * All of the motion is CSS and a few lines of JavaScript in the document
 * itself. Nothing is fetched, nothing is stored, and the server does no
 * more work than it did for the flat version.
 *
 * The rules it must never break, in order of how much trouble they save:
 *
 *  1. It says what it is, at the top, where nobody can miss it. A page
 *     carrying somebody's logo and photographs, sent to them unasked,
 *     has to be unmistakably a mock-up and unmistakably from us.
 *  2. Nothing on it is invented. Every word, picture, offer and number
 *     came off their own homepage, or is left out. A section we are
 *     proposing rather than rebuilding says so on its face, because a
 *     business owner who thinks we are showing them their own reviews
 *     and then finds we made them up is a business owner who is gone.
 *  3. It is never indexed. The link is unguessable and it expires.
 */

export type PreviewInput = {
  /** What we pulled off their homepage. */
  them: Rebuilt;
  /** Their address, as the page will show it. */
  website: string;
  /** What the scan found wrong, in the words the owner reads. */
  findings: string[];
  /** Their score out of 100, from the same scan. */
  score: number | null;
  /** The day this link stops working, as "3 December". */
  expires: string;
  /** Who is sending it, for the bar at the top. */
  from: string;
  /** The plain names of the checks their site failed, so the page can
   *  list what it has not got beside what we would put on it. Labels
   *  rather than the prose findings, because this is a checklist. */
  missing?: string[];
  /** Their Google rating and review count, where we hold them from the
   *  listing rather than from their page. Used in preference, because
   *  Google's numbers are the ones their customers see. */
  googleRating?: number | null;
  googleReviews?: number | null;
};

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Readable text on their colour, so a yellow brand does not get white type. */
function inkOn(hex: string): string {
  const h = hex.replace("#", "");
  if (h.length !== 6) return "#ffffff";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 150 ? "#ffffff" : "#111111";
}

type Stat = { value: string; suffix: string; label: string };

/**
 * The numbers that count up, and where each one came from.
 *
 * Only facts with a source. Their Google rating, their review count, the
 * year they say they started, and the score our own audit gave their
 * site. If a business has none of these the strip does not render, which
 * is the right answer: three invented numbers would undo the page.
 */
function statsFor(input: PreviewInput): Stat[] {
  const { them, score, googleRating, googleReviews } = input;
  const out: Stat[] = [];

  const rating = googleRating ?? (them.rating ? Number(them.rating) : null);
  if (rating && rating > 0 && rating <= 5) {
    out.push({ value: rating.toFixed(1), suffix: "", label: "Average rating" });
  }

  const reviews = googleReviews ?? (them.reviewCount ? Number(them.reviewCount) : null);
  if (reviews && reviews > 0) {
    out.push({ value: String(reviews), suffix: "", label: "Customer reviews" });
  }

  if (them.since) {
    const years = new Date().getFullYear() - Number(them.since);
    if (years > 0) out.push({ value: String(years), suffix: "", label: "Years in business" });
  }

  if (score !== null) {
    out.push({ value: String(score), suffix: "/100", label: "What your site scores today" });
  }

  return out.slice(0, 4);
}

/**
 * A section we are proposing, not one we rebuilt.
 *
 * Marked on its face, every time. These are the most persuasive part of
 * the page, because they are the only part showing something they have
 * not got, and that is exactly why they must not be mistaken for their
 * own content.
 */
function proposed(id: string, title: string, note: string, inner: string): string {
  return `<section id="${id}" class="add">
  <div class="wrap">
    <div class="addmark rise">Not on your site today &middot; we would add this</div>
    <h2 class="rise">${title}</h2>
    <p class="lead rise">${note}</p>
    ${inner}
  </div>
</section>`;
}

/**
 * What a site like theirs ought to have, in the order it earns money.
 *
 * Matched against the checks their own site failed, so every cross on
 * the list is a thing our audit actually found missing rather than a
 * thing we decided to sell them.
 */
const SHOULD_HAVE: { label: string; checks: string[]; why: string }[] = [
  {
    label: "A number you can tap",
    checks: ["Tappable phone number"],
    why: "On a phone, one tap dials you instead of them copying it out.",
  },
  {
    label: "An enquiry form",
    checks: ["Enquiry form"],
    why: "For the people who will never ring but will type.",
  },
  {
    label: "WhatsApp",
    checks: ["WhatsApp link"],
    why: "Most people answer a message faster than they answer a call.",
  },
  {
    label: "Your reviews, on your own site",
    checks: ["Reviews shown on site"],
    why: "The thing that decides it for somebody sitting on the fence.",
  },
  {
    label: "Online booking",
    checks: ["Online booking"],
    why: "So a job can be booked at nine at night without you.",
  },
  {
    label: "An answer out of hours",
    checks: ["Live chat or chatbot"],
    why: "An enquiry at eleven gets a reply, not a wait until morning.",
  },
  {
    label: "Knowing where your customers came from",
    checks: ["Google Analytics", "Meta Pixel", "Google Ads tracking", "Google Tag Manager"],
    why: "Otherwise every pound of advertising is spent blind.",
  },
  {
    label: "Showing up properly in Google",
    checks: ["Structured data", "Page title", "Meta description"],
    why: "What Google and the AI answers read to work out who you are.",
  },
];

export function previewPage(input: PreviewInput): string {
  const { them, website, findings, score, expires, from } = input;
  const failed = (input.missing ?? []).map((m) => m.toLowerCase());
  const wanted = SHOULD_HAVE.map((item) => ({
    ...item,
    has: !item.checks.some((c) => failed.includes(c.toLowerCase())),
  }));
  const gaps = wanted.filter((w) => !w.has).length;
  const brand = /^#[0-9a-f]{6}$/i.test(them.colour) ? them.colour : "#2563eb";
  const ink = inkOn(brand);
  const name = them.name || website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hero = them.images[0] ?? "";
  const gallery = them.images.slice(1, 7);
  const stats = statsFor(input);
  const tel = them.phone.replace(/\s+/g, "");
  const wa = siteConfig.whatsappNumber;
  const rating = input.googleRating ?? (them.rating ? Number(them.rating) : null);
  const reviewCount = input.googleReviews ?? (them.reviewCount ? Number(them.reviewCount) : null);
  const plain = website.replace(/^https?:\/\//, "").replace(/\/$/, "");

  // The navigation only offers what the page actually has, so nothing
  // leads anywhere empty.
  const nav: { id: string; label: string }[] = [
    { id: "top", label: "Home" },
    ...(them.services.length ? [{ id: "services", label: "Services" }] : []),
    ...(gallery.length ? [{ id: "work", label: "Our work" }] : []),
    { id: "reviews", label: "Reviews" },
    ...(them.about ? [{ id: "about", label: "About" }] : []),
    { id: "contact", label: "Contact" },
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: ${brand};
    --ink: ${ink};
    --bg: #05070a;
    --panel: #0b0f15;
    --line: rgba(255,255,255,.085);
    --soft: #94a0b1;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; scroll-padding-top: 90px; }
  /* Real pages, switched instantly. Theirs takes a second or two to load
     a new page; ours does not, and somebody clicking between the two
     feels that before they can name it. */
  .page { display: none; animation: arrive .45s cubic-bezier(.22,.61,.36,1); }
  .page.live { display: block; }
  @keyframes arrive { from { opacity: 0; transform: translateY(14px); } }
  .banner { padding: 86px 0 52px; border-bottom: 1px solid var(--line); position: relative; overflow: hidden; }
  .banner .wrap { position: relative; z-index: 2; }
  .banner h1 { font-size: clamp(32px, 5vw, 56px); margin: 0 0 12px; max-width: 18ch; }
  .banner p { color: var(--soft); max-width: 58ch; margin: 0; font-size: 16.5px; }
  .banner .glowbg { position: absolute; width: 620px; height: 620px; border-radius: 50%;
                    filter: blur(150px); background: var(--brand); opacity: .16; top: -300px; right: -140px; }
  body { margin: 0; background: var(--bg); color: #eef2f7;
         font-family: Inter, ui-sans-serif, system-ui, sans-serif; line-height: 1.62; overflow-x: hidden; }
  img { max-width: 100%; display: block; }
  h1, h2, h3, .num, .logo { font-family: Sora, Inter, sans-serif; letter-spacing: -.025em; }
  .wrap { max-width: 1140px; margin: 0 auto; padding: 0 22px; }
  a { color: inherit; }

  /* How far down they are. A small thing that makes a page feel built. */
  .progress { position: fixed; top: 0; left: 0; height: 2px; width: 0; background: var(--brand);
              z-index: 90; box-shadow: 0 0 14px var(--brand); transition: width .08s linear; }

  .mock { background: #000; color: #fff; font-size: 12.5px; padding: 9px 20px; text-align: center;
          position: relative; z-index: 60; }
  .mock b { font-weight: 700; }
  .mock span { opacity: .6; }

  .promo { background: var(--brand); color: var(--ink); text-align: center; font-weight: 700;
           font-size: 13.5px; padding: 9px 20px; position: relative; z-index: 55; overflow: hidden; }
  .promo i { font-style: normal; display: inline-block; animation: slide 22s linear infinite; }
  @keyframes slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }

  /* A real navigation, so it reads as a website rather than a page. */
  header { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(16px);
           background: rgba(5,7,10,.7); border-bottom: 1px solid transparent; transition: border-color .3s, background .3s; }
  header.stuck { border-bottom-color: var(--line); background: rgba(5,7,10,.92); }
  header .inner { display: flex; align-items: center; gap: 22px; max-width: 1140px; margin: 0 auto; padding: 13px 22px; }
  header img.mark { height: 38px; width: auto; }
  .logo { font-weight: 800; font-size: 18px; }
  nav { display: flex; gap: 22px; margin-left: 12px; }
  nav a { font-size: 14px; color: var(--soft); text-decoration: none; position: relative; padding: 4px 0;
          transition: color .2s; }
  nav a::after { content: ""; position: absolute; left: 0; bottom: 0; height: 2px; width: 0;
                 background: var(--brand); transition: width .25s; }
  nav a:hover { color: #fff; }
  nav a:hover::after, nav a.here::after { width: 100%; }
  nav a.here { color: #fff; }
  header .call { margin-left: auto; background: var(--brand); color: var(--ink); padding: 11px 20px;
                 border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 14.5px;
                 white-space: nowrap; transition: transform .2s, box-shadow .2s; }
  header .call:hover { transform: translateY(-1px); box-shadow: 0 12px 30px -10px var(--brand); }

  /* Hero. Their photograph, moving, with their colour bled through it. */
  .hero { position: relative; min-height: 92vh; display: flex; align-items: center; overflow: hidden; }
  .hero .shot { position: absolute; inset: -6%; background: #090d13 center/cover no-repeat;
                transform: scale(1.08); will-change: transform; }
  .hero::after { content: ""; position: absolute; inset: 0;
                 background: radial-gradient(85% 70% at 12% 42%, rgba(5,7,10,.5), rgba(5,7,10,.93) 68%),
                             linear-gradient(180deg, rgba(5,7,10,.35), rgba(5,7,10,.99)); }
  .blob { position: absolute; border-radius: 50%; filter: blur(140px); z-index: 1; pointer-events: none; }
  .blob.a { width: 720px; height: 720px; background: var(--brand); opacity: .24; top: -240px; right: -160px;
            animation: float 11s ease-in-out infinite alternate; }
  .blob.b { width: 460px; height: 460px; background: var(--brand); opacity: .12; bottom: -180px; left: -120px;
            animation: float 14s ease-in-out infinite alternate-reverse; }
  @keyframes float { to { transform: translate3d(40px, -30px, 0) scale(1.15); opacity: .34; } }
  .hero .wrap { position: relative; z-index: 2; padding: 100px 22px; }
  .eyebrow { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--line);
             background: rgba(255,255,255,.05); border-radius: 999px; padding: 7px 15px;
             font-size: 12.5px; color: var(--soft); margin-bottom: 22px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); box-shadow: 0 0 12px var(--brand);
         animation: beat 2.4s ease-in-out infinite; }
  @keyframes beat { 50% { transform: scale(1.5); opacity: .55; } }
  h1 { font-size: clamp(40px, 7vw, 82px); line-height: 1; font-weight: 800; margin: 0 0 20px; max-width: 15ch; }
  /* Each word arrives a beat after the last. */
  h1 span { display: inline-block; opacity: 0; transform: translateY(22px);
            animation: word .66s cubic-bezier(.22,.61,.36,1) forwards; }
  @keyframes word { to { opacity: 1; transform: none; } }
  .hero p { font-size: clamp(16px, 2vw, 19.5px); color: #c2cbd8; max-width: 52ch; margin: 0 0 34px; }
  .btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 9px; background: var(--brand); color: var(--ink);
         padding: 16px 30px; border-radius: 999px; text-decoration: none; font-weight: 800; font-size: 16.5px;
         transition: transform .2s, box-shadow .2s; box-shadow: 0 16px 42px -16px var(--brand); }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 24px 54px -16px var(--brand); }
  .btn.ghost { background: rgba(255,255,255,.07); color: #fff; border: 1px solid var(--line); box-shadow: none; }
  .cue { position: absolute; left: 50%; bottom: 26px; transform: translateX(-50%); z-index: 2;
         width: 24px; height: 38px; border: 2px solid rgba(255,255,255,.3); border-radius: 14px; }
  .cue::after { content: ""; position: absolute; left: 50%; top: 7px; width: 3px; height: 7px; border-radius: 2px;
                background: #fff; transform: translateX(-50%); animation: wheel 1.9s ease-in-out infinite; }
  @keyframes wheel { 50% { transform: translate(-50%, 13px); opacity: .25; } }

  /* The services, running past in a band, before the grid of them. */
  .ticker { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line);
            overflow: hidden; background: rgba(255,255,255,.015); padding: 15px 0; }
  .ticker .row { display: flex; gap: 48px; width: max-content; animation: slide 28s linear infinite; }
  .ticker span { font-family: Sora; font-weight: 600; font-size: 15px; color: var(--soft); white-space: nowrap; }
  .ticker b { color: var(--brand); margin-right: 48px; }

  .stats { border-bottom: 1px solid var(--line); background: rgba(255,255,255,.015); }
  .stats .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }
  .stat { padding: 36px 22px; text-align: center; border-right: 1px solid var(--line); }
  .stat:last-child { border-right: 0; }
  .num { font-size: clamp(32px, 4.6vw, 48px); font-weight: 800; color: #fff; line-height: 1; }
  .num span { color: var(--brand); }
  .stat .label { font-size: 12.5px; color: var(--soft); margin-top: 9px; }

  section { padding: 104px 0; position: relative; }
  .tag { display: inline-block; font-family: Sora; font-size: 12px; font-weight: 700; letter-spacing: .16em;
         text-transform: uppercase; color: var(--brand); margin-bottom: 14px; }
  h2 { font-size: clamp(27px, 3.6vw, 42px); font-weight: 800; margin: 0 0 12px; }
  .lead { color: var(--soft); margin: 0 0 42px; max-width: 58ch; font-size: 16.5px; }
  .cards { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
  .card { border: 1px solid var(--line); border-radius: 20px; padding: 28px; background: rgba(255,255,255,.025);
          transition: transform .35s cubic-bezier(.22,.61,.36,1), border-color .35s, background .35s;
          position: relative; overflow: hidden; }
  .card::before { content: ""; position: absolute; inset: 0; opacity: 0; transition: opacity .35s;
                  background: radial-gradient(60% 60% at 50% 0%, var(--brand), transparent 70%); }
  .card:hover { transform: translateY(-6px); border-color: var(--brand); background: rgba(255,255,255,.05); }
  .card:hover::before { opacity: .14; }
  .card .mark { width: 40px; height: 40px; border-radius: 12px; background: var(--brand); color: var(--ink);
                display: grid; place-items: center; font-weight: 800; margin-bottom: 16px; position: relative; }
  .card h3 { margin: 0; font-size: 17.5px; font-weight: 600; position: relative; }

  .shots { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .shots figure { margin: 0; overflow: hidden; border-radius: 20px; border: 1px solid var(--line); position: relative; }
  .shots img { aspect-ratio: 4/3; object-fit: cover; width: 100%; transition: transform .8s cubic-bezier(.22,.61,.36,1); }
  .shots figure:hover img { transform: scale(1.08); }

  .about { max-width: 62ch; font-size: 17.5px; color: #c2cbd8; }

  /* The sections we are proposing rather than rebuilding. */
  .add { background: linear-gradient(180deg, rgba(255,255,255,.02), transparent); }
  .addmark { display: inline-block; border: 1px dashed var(--brand); border-radius: 999px;
             padding: 6px 15px; font-size: 12px; font-weight: 700; color: var(--brand);
             margin-bottom: 16px; }
  .quotes { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
  .quote { border: 1px dashed var(--line); border-radius: 20px; padding: 26px; background: rgba(255,255,255,.02); }
  .quote .stars { color: var(--brand); letter-spacing: 3px; font-size: 15px; }
  .quote p { color: var(--soft); font-style: italic; margin: 12px 0 0; }
  .form { display: grid; gap: 12px; max-width: 560px; }
  .form .pair { display: grid; gap: 12px; grid-template-columns: 1fr 1fr; }
  .fake { border: 1px solid var(--line); border-radius: 13px; padding: 15px 17px; color: var(--soft);
          background: rgba(255,255,255,.03); font-size: 15px; }
  .form .send { background: var(--brand); color: var(--ink); border: 0; border-radius: 13px; padding: 16px;
                font: inherit; font-weight: 800; text-align: center; }
  .faq { border-top: 1px solid var(--line); }
  .faq div { border-bottom: 1px solid var(--line); padding: 20px 0; display: flex; gap: 16px; align-items: baseline; }
  .faq b { font-weight: 600; font-size: 16.5px; }
  .faq span { margin-left: auto; color: var(--brand); font-size: 22px; line-height: 1; }

  /* What they have, what they have not, and what one more job is worth. */
  .gaps { background: linear-gradient(180deg, rgba(255,255,255,.025), transparent); border-top: 1px solid var(--line); }
  .list { display: grid; gap: 2px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
  .item { display: flex; gap: 14px; align-items: flex-start; padding: 17px 18px; border-radius: 14px;
          border: 1px solid transparent; }
  .item.no { background: rgba(255,255,255,.03); border-color: var(--line); }
  .item .box { width: 22px; height: 22px; border-radius: 7px; flex: none; display: grid; place-items: center;
               font-size: 13px; font-weight: 800; margin-top: 2px; }
  .item.yes .box { background: rgba(255,255,255,.08); color: var(--soft); }
  .item.no .box { background: var(--brand); color: var(--ink); }
  .item b { display: block; font-weight: 600; font-size: 16px; }
  .item.yes b { color: var(--soft); }
  .item small { color: var(--soft); font-size: 13.5px; display: block; margin-top: 3px; }

  .sum { margin-top: 44px; border: 1px solid var(--line); border-radius: 22px; padding: 30px;
         background: rgba(255,255,255,.03); max-width: 720px; }
  .sum h3 { margin: 0 0 8px; font-size: 20px; }
  .sum .row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; margin: 22px 0 6px; }
  .sum label { font-size: 14.5px; color: var(--soft); }
  .sum input[type=number] { width: 120px; font: inherit; font-weight: 700; color: #fff; padding: 11px 13px;
                            border-radius: 11px; border: 1px solid var(--line); background: rgba(0,0,0,.35); }
  .sum input[type=range] { flex: 1; min-width: 180px; accent-color: var(--brand); }
  .sum .out { font-family: Sora; font-weight: 800; font-size: clamp(30px, 4.4vw, 46px); color: var(--brand);
              line-height: 1.05; margin-top: 14px; }
  .sum .cav { color: var(--soft); font-size: 13px; margin-top: 12px; }

  /* The part after the website. A site nobody lands on is a leaflet in
     a drawer, and saying so is more honest than selling one and
     stopping there. */
  .next { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); margin-top: 44px; }
  .step { border: 1px solid var(--line); border-radius: 20px; padding: 26px; background: rgba(255,255,255,.025);
          position: relative; }
  .step .n { font-family: Sora; font-size: 13px; font-weight: 800; color: var(--brand); letter-spacing: .1em; }
  .step h3 { margin: 10px 0 8px; font-size: 18.5px; font-weight: 700; }
  .step p { margin: 0; color: var(--soft); font-size: 14.5px; }
  .chain { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-top: 30px;
           font-family: Sora; font-weight: 700; font-size: 15px; }
  .chain i { font-style: normal; border: 1px solid var(--line); border-radius: 999px; padding: 9px 17px;
             background: rgba(255,255,255,.03); }
  .chain i.lit { border-color: var(--brand); color: var(--brand); }
  .chain s { text-decoration: none; color: var(--brand); }

  /* What we changed. The one section that is about them, not about the site. */
  .fixes { background: linear-gradient(180deg, #080b11, #05070a); border-top: 1px solid var(--line); }
  .pill { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 7px 16px;
          font-size: 12.5px; color: var(--soft); margin-bottom: 20px; }
  .fix { display: flex; gap: 18px; padding: 22px 0; border-top: 1px solid var(--line); }
  .fix .n { font-family: Sora; color: var(--brand); font-weight: 800; font-size: 15px; min-width: 28px; }
  .fix p { margin: 0; color: #c2cbd8; }

  footer { padding: 96px 0 130px; text-align: center; border-top: 1px solid var(--line); position: relative; }
  footer .big { font-family: Sora; font-size: clamp(26px, 3.6vw, 40px); font-weight: 800; margin-bottom: 12px; }
  footer .small { color: var(--soft); font-size: 13.5px; margin-top: 28px; }

  .wa { position: fixed; right: 18px; bottom: 18px; z-index: 70; width: 58px; height: 58px; border-radius: 50%;
        background: #25d366; display: grid; place-items: center; box-shadow: 0 14px 34px -8px rgba(37,211,102,.6);
        opacity: 0; transform: translateY(18px) scale(.85); pointer-events: none;
        transition: opacity .35s, transform .35s; }
  .wa.on { opacity: 1; transform: none; pointer-events: auto; }
  .wa:hover { transform: scale(1.08); }
  .wa svg { width: 30px; height: 30px; fill: #fff; }

  .rise { opacity: 0; transform: translateY(28px);
          transition: opacity .75s cubic-bezier(.22,.61,.36,1), transform .75s cubic-bezier(.22,.61,.36,1); }
  .rise.in { opacity: 1; transform: none; }

  /* No band behind it. A gradient that fades to nothing leaves the
     paragraph underneath half-visible across the full width, which
     reads as a rendering fault rather than a design. The pill is solid,
     so it can float over the page on its own. */
  /* A solid row under the header rather than a pill floating over the
     page. It is sticky for the whole document, and a see-through pill
     parked on top of a paragraph reads as a rendering fault; as a bar
     it reads as part of the furniture. Worth the strip of height: this
     is the one control the whole page is built around. */
  .flip { position: sticky; top: 64px; z-index: 48; display: flex; justify-content: center;
          padding: 10px 0; background: rgba(5,7,10,.92); backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--line); }
  /* Solid rather than translucent. It is sticky for the whole page, so
     a see-through pill puts a paragraph straight through the middle of
     the two words somebody is trying to read. */
  .flip .set { display: inline-flex; background: rgba(9,11,16,.94); border: 1px solid var(--line);
               border-radius: 999px; padding: 4px; gap: 3px;
               backdrop-filter: blur(14px); box-shadow: 0 12px 30px rgba(0,0,0,.5); }
  .flip button { appearance: none; border: 0; cursor: pointer; font: inherit; font-weight: 700;
                 font-size: 13.5px; padding: 9px 20px; border-radius: 999px; color: var(--soft);
                 background: transparent; transition: background .2s, color .2s; }
  .flip button[aria-pressed="true"] { background: var(--brand); color: var(--ink); }
  #before { display: none; }
  #before.on { display: block; }
  .theirs { border: 1px solid var(--line); border-radius: 20px; overflow: hidden; background: #fff; }
  .theirs iframe { width: 100%; height: 72vh; border: 0; display: block; background: #fff; }
  .theirs .note { padding: 14px 18px; font-size: 13px; color: var(--soft); background: var(--panel);
                  border-bottom: 1px solid var(--line); }
  .theirs .note a { color: #fff; }

  .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 65; display: none; gap: 10px; padding: 10px 12px;
         background: rgba(5,7,10,.95); border-top: 1px solid var(--line); backdrop-filter: blur(10px); }
  .bar a { flex: 1; text-align: center; padding: 15px; border-radius: 14px; text-decoration: none; font-weight: 800; }
  .bar .a { background: var(--brand); color: var(--ink); }

  @media (max-width: 880px) { nav { display: none; } }
  @media (max-width: 780px) {
    .bar { display: flex; }
    body { padding-bottom: 82px; }
    header .call { display: none; }
    .wa { bottom: 92px; }
    .hero { min-height: 78vh; }
    .stat { border-right: 0; border-bottom: 1px solid var(--line); padding: 26px 18px; }
    section { padding: 72px 0; }
    .form .pair { grid-template-columns: 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation: none !important; transition: none !important; }
    .rise, h1 span { opacity: 1 !important; transform: none !important; }
  }
</style>
</head>
<body>

<div class="progress" id="progress"></div>

<div class="mock">
  <b>A mock-up built for ${esc(name)} by ${esc(from)}.</b>
  <span>Not a live website. This link stops working on ${esc(expires)}.</span>
</div>

${them.promo ? `<div class="promo"><i>${esc(them.promo)}&nbsp;&nbsp;&middot;&nbsp;&nbsp;${esc(them.promo)}&nbsp;&nbsp;&middot;&nbsp;&nbsp;</i></div>` : ""}

<header id="head"><div class="inner">
  ${them.logo ? `<img class="mark" src="${esc(them.logo)}" alt="${esc(name)}">` : `<div class="logo">${esc(name)}</div>`}
  <nav>
    ${nav.map((n) => `<a href="#${n.id}" data-page="${n.id}">${esc(n.label)}</a>`).join("\n    ")}
  </nav>
  ${tel ? `<a class="call" href="tel:${esc(tel)}">${esc(them.phone)}</a>` : `<a class="call" href="#contact">Get in touch</a>`}
</div></header>

<div class="flip">
  <div class="set" role="group" aria-label="Which version to show">
    <button id="tab-after" aria-pressed="true">Rebuilt</button>
    <button id="tab-before" aria-pressed="false">Your site now</button>
  </div>
</div>

<section id="before"><div class="wrap">
  <h2>Your website as it is today</h2>
  <p class="lead">Loaded live from ${esc(plain)}. Nothing has been changed.</p>
  <div class="theirs">
    <div class="note">Some sites refuse to load inside another page. If the panel below is blank,
      <a href="${esc(website)}" target="_blank" rel="noreferrer noopener">open your site in a new tab</a>
      and put the two side by side.</div>
    <iframe data-src="${esc(website)}" title="Your current website" loading="lazy" referrerpolicy="no-referrer"></iframe>
  </div>
</div></section>

<div id="after">

<div class="page live" id="page-top">
<div class="hero">
  ${hero ? `<div class="shot" id="shot" style="background-image:url('${esc(hero)}')"></div>` : `<div class="shot" id="shot"></div>`}
  <div class="blob a"></div>
  <div class="blob b"></div>
  <div class="wrap">
    <div class="eyebrow rise"><span class="dot"></span> ${esc(name)}${them.since ? ` &middot; since ${esc(them.since)}` : ""}</div>
    <h1 id="headline">${esc(them.tagline && them.tagline.length < 70 ? them.tagline : name)}</h1>
    ${them.tagline && them.tagline.length >= 70 ? `<p class="rise">${esc(them.tagline)}</p>` : ""}
    <div class="btns rise">
      ${tel ? `<a class="btn" href="tel:${esc(tel)}">Call ${esc(them.phone)}</a>` : ""}
      <a class="btn ghost" href="#contact">Get a quote</a>
    </div>
  </div>
  <div class="cue"></div>
</div>

${
  them.services.length
    ? `<div class="ticker"><div class="row">
  ${[...them.services, ...them.services].map((s) => `<span><b>&bull;</b>${esc(s)}</span>`).join("\n  ")}
</div></div>`
    : ""
}

${
  stats.length
    ? `<div class="stats"><div class="grid">
  ${stats
    .map(
      (s) =>
        `<div class="stat rise"><div class="num" data-to="${esc(s.value)}">0<span>${esc(s.suffix)}</span></div><div class="label">${esc(s.label)}</div></div>`,
    )
    .join("\n  ")}
</div></div>`
    : ""
}

${
  them.services.length
    ? `<section><div class="wrap">
  <span class="tag rise">What we do</span>
  <h2 class="rise">Everything, done properly</h2>
  <p class="lead rise">Taken from your own website. Nothing added, nothing invented.</p>
  <div class="cards">
    ${them.services
      .slice(0, 6)
      .map(
        (s, i) =>
          `<div class="card rise" style="transition-delay:${i * 70}ms"><div class="mark">${String(i + 1).padStart(2, "0")}</div><h3>${esc(s)}</h3></div>`,
      )
      .join("\n    ")}
  </div>
</div></section>`
    : ""
}
</div><!-- /page-top -->

${
  them.services.length
    ? `<div class="page" id="page-services">
  <div class="banner"><div class="glowbg"></div><div class="wrap">
    <span class="tag">Services</span>
    <h1>What ${esc(name)} does</h1>
    <p>Every one of these is already on your own website. A page each is how somebody searching for one of them finds you.</p>
  </div></div>
  <section><div class="wrap">
    <div class="cards">
      ${them.services
        .map(
          (s, i) =>
            `<div class="card rise" style="transition-delay:${(i % 6) * 70}ms"><div class="mark">${String(i + 1).padStart(2, "0")}</div><h3>${esc(s)}</h3></div>`,
        )
        .join("\n      ")}
    </div>
  </div></section>
</div>`
    : ""
}

${
  gallery.length
    ? `<div class="page" id="page-work">
  <div class="banner"><div class="glowbg"></div><div class="wrap">
    <span class="tag">Our work</span>
    <h1>The work, not a stock photograph</h1>
    <p>Every picture here is one of yours, loaded from your own server.</p>
  </div></div>
  <section><div class="wrap">
  <span class="tag rise">Our work</span>
  <h2 class="rise">Your own photographs, shown properly</h2>
  <p class="lead rise">Same pictures that are on your site now, given the room they deserve.</p>
  <div class="shots">
    ${gallery
      .map(
        (src, i) =>
          `<figure class="rise" style="transition-delay:${i * 80}ms"><img src="${esc(src)}" alt="" loading="lazy"></figure>`,
      )
      .join("\n    ")}
  </div>
</div></section></div>`
    : ""
}

<div class="page" id="page-reviews">
${proposed(
  "reviews",
  "What your customers say",
  rating && reviewCount
    ? `You are on ${rating.toFixed(1)} from ${reviewCount} reviews on Google, and none of it is on your website. This section pulls them in automatically as they come, so the newest one is always showing.`
    : "Your Google reviews, pulled in automatically as they come, so the newest one is always showing.",
  `<div class="quotes">
      ${[0, 1, 2]
        .map(
          (i) =>
            `<div class="quote rise" style="transition-delay:${i * 80}ms">
        <div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
        <p>Your real Google reviews appear here. We do not write them and we do not choose them.</p>
      </div>`,
        )
        .join("\n      ")}
    </div>`,
)}

</div>

${
  them.about
    ? `<div class="page" id="page-about"><section><div class="wrap">
  <span class="tag rise">About</span>
  <h2 class="rise">About ${esc(name)}</h2>
  <p class="about rise">${esc(them.about)}</p>
</div></section></div>`
    : ""
}

<div class="page" id="page-contact">

${proposed(
  "contact",
  "Get a quote in thirty seconds",
  "Four boxes, nothing else. Every enquiry lands in one place and gets an answer within seconds, day or night, signed in your name.",
  `<div class="form rise">
      <div class="pair"><div class="fake">Your name</div><div class="fake">Phone number</div></div>
      <div class="fake">What do you need?</div>
      <div class="send">Send it</div>
    </div>`,
)}

${proposed(
  "faq",
  "The questions you get asked every day",
  "Written once, answered forever. These are also the questions people type into Google, which is how a page like this gets found.",
  `<div class="faq rise">
      ${["How much does it cost?", "How soon can you come out?", "Which areas do you cover?", "Are you insured?"]
        .map((q) => `<div><b>${esc(q)}</b><span>+</span></div>`)
        .join("\n      ")}
    </div>`,
)}
</div><!-- /page-contact -->
</div><!-- /after -->

<section class="gaps"><div class="wrap">
  <span class="tag rise">What is missing</span>
  <h2 class="rise">${gaps > 0 ? `${gaps} thing${gaps === 1 ? "" : "s"} your site has not got` : "What a site like yours should have"}</h2>
  <p class="lead rise">Ticked is what you already have. The rest is what we would put on, and what each one is for.</p>

  <div class="list">
    ${wanted
      .map(
        (w, i) =>
          `<div class="item ${w.has ? "yes" : "no"} rise" style="transition-delay:${(i % 8) * 50}ms">
        <span class="box">${w.has ? "&#10003;" : "+"}</span>
        <span><b>${esc(w.label)}</b><small>${w.has ? "Already on your site." : esc(w.why)}</small></span>
      </div>`,
      )
      .join("\n    ")}
  </div>

  <!-- Their arithmetic, on a number they choose. Not a forecast, and it
       says so: we have no idea what they charge or how many enquiries
       they get, and a page that guessed would be caught out by the only
       person who knows. -->
  <div class="sum rise">
    <h3>What would one more job a month be worth?</h3>
    <p class="lead" style="margin:0">We do not know what you charge, so put your own number in.</p>
    <div class="row">
      <label for="job">An average job is worth</label>
      <span style="font-weight:700">&pound;</span>
      <input id="job" type="number" min="20" max="20000" step="10" value="400" aria-label="Average job value in pounds">
      <input id="jobr" type="range" min="50" max="5000" step="50" value="400" aria-label="Average job value">
    </div>
    <div class="out"><span id="year">&pound;4,800</span> a year</div>
    <p class="cav">That is one extra job a month, times twelve, at the figure you typed. It is arithmetic on
      your own number, not a promise and not a prediction. Nobody can tell you in advance what a website will
      bring in, and anybody who does is guessing.</p>
  </div>
</div></section>

<section><div class="wrap">
  <span class="tag rise">After the website</span>
  <h2 class="rise">A good site on its own is a leaflet in a drawer</h2>
  <p class="lead rise">Worth saying plainly, because it is the bit most people selling websites leave out.
    A website only works on people who already found you. These are the two halves that put somebody in
    front of it and make sure nobody who lands gets dropped.</p>

  <div class="chain rise">
    <i class="lit">Google &amp; Meta ads</i><s>&rarr;</s>
    <i class="lit">your website</i><s>&rarr;</s>
    <i class="lit">a CRM that catches it</i><s>&rarr;</s>
    <i>a job</i>
  </div>

  <div class="next">
    <div class="step rise"><div class="n">01</div>
      <h3>Google and Meta ads</h3>
      <p>Somebody searching for what you do today, in the towns you cover, and somebody who has
        never heard of you seeing your work on their phone tonight. Watched weekly and turned off
        where it is not paying, rather than left running quietly.</p>
    </div>
    <div class="step rise" style="transition-delay:80ms"><div class="n">02</div>
      <h3>A CRM behind it</h3>
      <p>Every enquiry, from the site, the ads, the phone and WhatsApp, landing in one place with
        the source against it. Answered within seconds, chased if nobody replies, and nothing
        sitting in an inbox overnight.</p>
    </div>
    <div class="step rise" style="transition-delay:160ms"><div class="n">03</div>
      <h3>Then you can see what works</h3>
      <p>With all three you know what you spent, how many enquiries came of it and what each one
        cost. Without the middle two the website is guesswork, however good it looks.</p>
    </div>
  </div>
</div></section>

<section class="fixes"><div class="wrap">
  ${score !== null ? `<div class="pill rise">Your website scored ${score} out of 100 on our audit</div>` : ""}
  <span class="tag rise">The honest part</span>
  <h2 class="rise">What we changed, and what it was costing you</h2>
  <p class="lead rise">Every one of these is on your site right now. Check them yourself.</p>
  ${findings
    .map(
      (f, i) =>
        `<div class="fix rise" style="transition-delay:${i * 60}ms"><span class="n">${String(i + 1).padStart(2, "0")}</span><p>${esc(f)}</p></div>`,
    )
    .join("\n  ")}
</div></section>

<footer><div class="wrap">
  <div class="big rise">Want this one instead?</div>
  <div class="lead rise" style="margin:0 auto">Reply to the email, or ring ${esc(siteConfig.phoneDisplay)} and we will talk it through. No obligation and no sales pitch.</div>
  <div class="btns rise" style="justify-content:center;margin-top:28px">
    <a class="btn" href="https://wa.me/${esc(wa)}">Message on WhatsApp</a>
    <a class="btn ghost" href="tel:${esc(siteConfig.phoneE164)}">Call ${esc(siteConfig.phoneDisplay)}</a>
  </div>
  <div class="small">Built by ${esc(from)} &middot; ${esc(siteConfig.url)}</div>
</div></footer>

<a class="wa" href="https://wa.me/${esc(wa)}" aria-label="Message us on WhatsApp">
  <svg viewBox="0 0 24 24" aria-hidden><path d="M.06 24l1.69-6.16A11.87 11.87 0 010 11.9C0 5.33 5.34 0 11.9 0a11.82 11.82 0 018.42 3.49 11.82 11.82 0 013.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.69-1.45L.06 24zm6.6-3.8c1.68.99 3.28 1.58 5.24 1.58 5.45 0 9.9-4.43 9.9-9.88a9.86 9.86 0 00-9.9-9.89C6.45 2.01 2 6.45 2 11.9c0 2.06.6 3.6 1.62 5.22l-.99 3.62 3.73-.98-.7.44zm11.6-5.57c-.07-.12-.27-.2-.57-.35-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48a9 9 0 01-1.66-2.06c-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.59-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.29.18-1.41z"/></svg>
</a>

<div class="bar">
  ${tel ? `<a class="a" href="tel:${esc(tel)}">Call now</a>` : ""}
  <a class="a" style="background:#25d366;color:#fff" href="https://wa.me/${esc(wa)}">WhatsApp</a>
</div>

<script>
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The headline, a word at a time.
  var h1 = document.getElementById('headline');
  if (h1 && !reduce) {
    var words = h1.textContent.split(' ');
    h1.innerHTML = words.map(function (w, i) {
      return '<span style="animation-delay:' + (120 + i * 70) + 'ms">' + w + '</span>';
    }).join(' ');
  }

  var rise = document.querySelectorAll('.rise');
  if (reduce || !('IntersectionObserver' in window)) {
    rise.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.num').forEach(function (el) { el.firstChild.nodeValue = el.dataset.to; });
    document.querySelector('.wa').classList.add('on');
  } else {
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        seen.unobserve(e.target);
        var num = e.target.querySelector('.num');
        if (num) count(num);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    rise.forEach(function (el) { seen.observe(el); });
  }

  // Counts to the real value, decimals kept, so 4.8 does not land on 5.
  function count(el) {
    var target = parseFloat(el.dataset.to);
    if (isNaN(target)) { el.firstChild.nodeValue = el.dataset.to; return; }
    var dp = (el.dataset.to.split('.')[1] || '').length;
    var started = null, ms = 1200;
    function step(now) {
      if (!started) started = now;
      var p = Math.min(1, (now - started) / ms);
      el.firstChild.nodeValue = (target * (1 - Math.pow(1 - p, 3))).toFixed(dp);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Real pages. Switched instantly, which is half the argument: theirs
  // reloads for a second or two, ours does not.
  var pages = [].slice.call(document.querySelectorAll('.page'));
  var links = [].slice.call(document.querySelectorAll('nav a'));
  function goTo(id) {
    var found = document.getElementById('page-' + id);
    if (!found) return false;
    pages.forEach(function (pg) { pg.classList.toggle('live', pg === found); });
    links.forEach(function (a) { a.classList.toggle('here', a.dataset.page === id); });
    window.scrollTo(0, 0);
    // Anything on the page that was waiting to arrive, arrives now.
    found.querySelectorAll('.rise').forEach(function (el) { el.classList.add('in'); });
    found.querySelectorAll('.num').forEach(function (el) { count(el); });
    return true;
  }
  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (goTo(a.dataset.page)) e.preventDefault();
    });
  });
  // Any other link to a page on this mock-up, such as the hero buttons.
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    if (!document.getElementById('page-' + id)) return;
    a.addEventListener('click', function (e) { if (goTo(id)) e.preventDefault(); });
  });

  // Their site against ours. The frame is only loaded when somebody asks
  // for it: their homepage is often megabytes, and making our page wait
  // on it would hand them the one comparison we are trying to win.
  var after = document.getElementById('after');
  var before = document.getElementById('before');
  var tabA = document.getElementById('tab-after');
  var tabB = document.getElementById('tab-before');
  var frame = before.querySelector('iframe');
  function show(theirs) {
    if (theirs && frame && !frame.src) frame.src = frame.dataset.src;
    before.classList.toggle('on', theirs);
    after.style.display = theirs ? 'none' : '';
    tabB.setAttribute('aria-pressed', String(theirs));
    tabA.setAttribute('aria-pressed', String(!theirs));
    window.scrollTo(0, 0);
  }
  tabA.addEventListener('click', function () { show(false); });
  tabB.addEventListener('click', function () { show(true); });

  // One more job a month, at whatever they say a job is worth.
  var job = document.getElementById('job');
  var jobr = document.getElementById('jobr');
  var year = document.getElementById('year');
  function sum(from) {
    var v = Math.max(0, Math.min(20000, Number(from.value) || 0));
    if (from === job) jobr.value = Math.max(50, Math.min(5000, v));
    else job.value = v;
    year.textContent = '\u00A3' + (v * 12).toLocaleString('en-GB');
  }
  if (job && jobr && year) {
    job.addEventListener('input', function () { sum(job); });
    jobr.addEventListener('input', function () { sum(jobr); });
  }

  var head = document.getElementById('head');
  var shot = document.getElementById('shot');
  var wa = document.querySelector('.wa');
  var bar = document.getElementById('progress');
  var ticking = false;

  links.forEach(function (a) { a.classList.toggle('here', a.dataset.page === 'top'); });

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var y = window.scrollY;
      var tall = document.body.scrollHeight - window.innerHeight;
      bar.style.width = (tall > 0 ? (y / tall) * 100 : 0) + '%';
      head.classList.toggle('stuck', y > 40);
      if (wa) wa.classList.toggle('on', y > 420);
      // The hero photograph drifts slower than the page does.
      if (shot && !reduce && y < window.innerHeight * 1.2) {
        shot.style.transform = 'scale(1.08) translate3d(0,' + (y * 0.22) + 'px,0)';
      }
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>

</body>
</html>`;
}

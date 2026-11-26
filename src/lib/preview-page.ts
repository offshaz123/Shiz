import type { Rebuilt } from "./site-rebuild";
import { siteConfig } from "./site-config";

/**
 * Their own website, rebuilt, as one page they can look at.
 *
 * Written as a string of HTML rather than as a React component on purpose.
 * This page borrows the business's own colour, carries their own
 * photographs and is served on its own with nothing of ours around it,
 * which is a different job from every other page on this site.
 *
 * It has to look expensive. The whole pitch is a person opening it on a
 * phone and thinking "that is better than mine", so it moves: things
 * arrive as you reach them, the numbers count up, and the call button
 * follows you down the page. None of that is decoration. A page that
 * feels alive is the argument, and the price lands softer afterwards.
 *
 * The rules it must never break, in order of how much trouble they save:
 *
 *  1. It says what it is, at the top, where nobody can miss it. A page
 *     carrying somebody's logo and photographs, sent to them unasked,
 *     has to be unmistakably a mock-up and unmistakably from us.
 *  2. Nothing on it is invented. Every word, picture, offer and number
 *     came off their own homepage, or is left out. The counters are the
 *     part to watch: an impressive number nobody can evidence is the one
 *     thing that would turn this from flattering into embarrassing.
 *  3. It is never indexed. The link is unguessable, the page says
 *     noindex, and it expires.
 *
 * Their photographs stay on their own server. We point at them, so
 * nothing of theirs is copied onto ours, and if their host refuses the
 * request the page carries on without the picture.
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

export function previewPage(input: PreviewInput): string {
  const { them, website, findings, score, expires, from } = input;
  const brand = /^#[0-9a-f]{6}$/i.test(them.colour) ? them.colour : "#2563eb";
  const ink = inkOn(brand);
  const name = them.name || website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hero = them.images[0] ?? "";
  const gallery = them.images.slice(1, 4);
  const stats = statsFor(input);
  const tel = them.phone.replace(/\s+/g, "");
  const wa = siteConfig.whatsappNumber;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>${esc(name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --brand: ${brand};
    --ink: ${ink};
    --bg: #07090d;
    --panel: #0d1117;
    --line: rgba(255,255,255,.09);
    --soft: #99a3b3;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; background: var(--bg); color: #eef2f7;
         font-family: Inter, ui-sans-serif, system-ui, sans-serif; line-height: 1.6; overflow-x: hidden; }
  img { max-width: 100%; display: block; }
  h1, h2, h3, .num { font-family: Sora, Inter, sans-serif; letter-spacing: -.025em; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 22px; }

  /* The bar that says what this is. Not dismissible, never animated away. */
  .mock { background: #000; color: #fff; font-size: 12.5px; padding: 9px 20px; text-align: center;
          position: relative; z-index: 60; }
  .mock b { font-weight: 700; }
  .mock span { opacity: .6; }

  /* Their own offer, in their own words. */
  .promo { background: var(--brand); color: var(--ink); text-align: center; font-weight: 700;
           font-size: 13.5px; padding: 9px 20px; position: relative; z-index: 55; }

  header { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(14px);
           background: rgba(7,9,13,.72); border-bottom: 1px solid var(--line); }
  header .inner { display: flex; align-items: center; gap: 16px; max-width: 1120px; margin: 0 auto; padding: 14px 22px; }
  header img { height: 40px; width: auto; }
  header .name { font-family: Sora; font-weight: 800; font-size: 19px; }
  header .call { margin-left: auto; background: var(--brand); color: var(--ink); padding: 11px 20px;
                 border-radius: 999px; text-decoration: none; font-weight: 700; font-size: 14.5px;
                 transition: transform .2s, box-shadow .2s; }
  header .call:hover { transform: translateY(-1px); box-shadow: 0 10px 30px -10px var(--brand); }

  /* Hero. The glow behind it is what stops a dark page looking flat. */
  .hero { position: relative; min-height: 86vh; display: flex; align-items: center; overflow: hidden; }
  .hero .shot { position: absolute; inset: 0; background: #0b0f16 center/cover no-repeat; transform: scale(1.06);
                animation: drift 22s ease-in-out infinite alternate; }
  @keyframes drift { to { transform: scale(1.14) translate3d(-1.5%, -1%, 0); } }
  .hero::after { content: ""; position: absolute; inset: 0;
                 background: radial-gradient(90% 70% at 15% 40%, rgba(7,9,13,.55), rgba(7,9,13,.94) 70%),
                             linear-gradient(180deg, rgba(7,9,13,.4), rgba(7,9,13,.98)); }
  .glow { position: absolute; width: 760px; height: 760px; border-radius: 50%; filter: blur(130px);
          background: var(--brand); opacity: .22; top: -220px; right: -180px; z-index: 1;
          animation: pulse 9s ease-in-out infinite alternate; }
  @keyframes pulse { to { opacity: .34; transform: scale(1.12); } }
  .hero .wrap { position: relative; z-index: 2; padding: 90px 22px; }
  .eyebrow { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--line);
             background: rgba(255,255,255,.05); border-radius: 999px; padding: 7px 15px;
             font-size: 12.5px; color: var(--soft); margin-bottom: 22px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--brand); box-shadow: 0 0 12px var(--brand); }
  h1 { font-size: clamp(38px, 6.4vw, 74px); line-height: 1.02; font-weight: 800; margin: 0 0 20px; max-width: 15ch; }
  .hero p { font-size: clamp(16px, 2vw, 19px); color: #c4cdda; max-width: 52ch; margin: 0 0 34px; }
  .btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn { display: inline-flex; align-items: center; gap: 9px; background: var(--brand); color: var(--ink);
         padding: 16px 30px; border-radius: 999px; text-decoration: none; font-weight: 800; font-size: 16.5px;
         transition: transform .2s, box-shadow .2s; box-shadow: 0 16px 40px -16px var(--brand); }
  .btn:hover { transform: translateY(-2px); box-shadow: 0 22px 50px -16px var(--brand); }
  .btn.ghost { background: rgba(255,255,255,.07); color: #fff; border: 1px solid var(--line); box-shadow: none; }

  /* The numbers. They count up when you reach them. */
  .stats { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: rgba(255,255,255,.015); }
  .stats .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); }
  .stat { padding: 34px 22px; text-align: center; border-right: 1px solid var(--line); }
  .stat:last-child { border-right: 0; }
  .num { font-size: clamp(32px, 4.4vw, 46px); font-weight: 800; color: #fff; line-height: 1; }
  .num span { color: var(--brand); }
  .stat .label { font-size: 12.5px; color: var(--soft); margin-top: 9px; letter-spacing: .02em; }

  section { padding: 96px 0; }
  h2 { font-size: clamp(26px, 3.4vw, 38px); font-weight: 800; margin: 0 0 12px; }
  .lead { color: var(--soft); margin: 0 0 40px; max-width: 58ch; font-size: 16.5px; }
  .cards { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
  .card { border: 1px solid var(--line); border-radius: 18px; padding: 26px; background: rgba(255,255,255,.025);
          transition: transform .3s, border-color .3s, background .3s; }
  .card:hover { transform: translateY(-4px); border-color: var(--brand); background: rgba(255,255,255,.05); }
  .card .mark { width: 38px; height: 38px; border-radius: 11px; background: var(--brand); color: var(--ink);
                display: grid; place-items: center; font-weight: 800; margin-bottom: 15px; }
  .card h3 { margin: 0; font-size: 17.5px; font-weight: 600; }

  .shots { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .shots figure { margin: 0; overflow: hidden; border-radius: 18px; border: 1px solid var(--line); }
  .shots img { aspect-ratio: 4/3; object-fit: cover; width: 100%; transition: transform .6s ease; }
  .shots figure:hover img { transform: scale(1.06); }

  .about { max-width: 62ch; font-size: 17.5px; color: #c4cdda; }

  /* What we changed. The one part that is about them, not us. */
  .fixes { background: linear-gradient(180deg, #0a0d13, #07090d); border-top: 1px solid var(--line); }
  .pill { display: inline-block; border: 1px solid var(--line); border-radius: 999px; padding: 7px 16px;
          font-size: 12.5px; color: var(--soft); margin-bottom: 20px; }
  .fix { display: flex; gap: 18px; padding: 22px 0; border-top: 1px solid var(--line); }
  .fix .n { font-family: Sora; color: var(--brand); font-weight: 800; font-size: 15px; min-width: 26px; }
  .fix p { margin: 0; color: #c4cdda; }

  footer { padding: 86px 0 120px; text-align: center; border-top: 1px solid var(--line); }
  footer .big { font-family: Sora; font-size: clamp(24px, 3.2vw, 34px); font-weight: 800; margin-bottom: 12px; }
  footer .small { color: var(--soft); font-size: 13.5px; margin-top: 26px; }

  /* WhatsApp, bottom right, once you have started reading. */
  .wa { position: fixed; right: 18px; bottom: 18px; z-index: 70; width: 58px; height: 58px; border-radius: 50%;
        background: #25d366; display: grid; place-items: center; box-shadow: 0 14px 34px -8px rgba(37,211,102,.6);
        opacity: 0; transform: translateY(18px) scale(.85); pointer-events: none;
        transition: opacity .35s, transform .35s; }
  .wa.on { opacity: 1; transform: none; pointer-events: auto; }
  .wa:hover { transform: scale(1.07); }
  .wa svg { width: 30px; height: 30px; fill: #fff; }

  /* Arrive as you reach them. */
  .rise { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.22,.61,.36,1), transform .7s cubic-bezier(.22,.61,.36,1); }
  .rise.in { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) {
    .rise, .hero .shot, .glow { animation: none !important; transition: none !important; opacity: 1 !important; transform: none !important; }
  }

  /* Their site, and ours, one tap apart. The whole argument on one control. */
  .flip { position: sticky; top: 69px; z-index: 48; display: flex; justify-content: center;
          padding: 14px 0; background: linear-gradient(180deg, rgba(7,9,13,.96), rgba(7,9,13,0)); }
  .flip .set { display: inline-flex; background: rgba(255,255,255,.06); border: 1px solid var(--line);
               border-radius: 999px; padding: 4px; gap: 3px; }
  .flip button { appearance: none; border: 0; cursor: pointer; font: inherit; font-weight: 700;
                 font-size: 13.5px; padding: 9px 20px; border-radius: 999px; color: var(--soft);
                 background: transparent; transition: background .2s, color .2s; }
  .flip button[aria-pressed="true"] { background: var(--brand); color: var(--ink); }
  #before { display: none; }
  #before.on { display: block; }
  .theirs { border: 1px solid var(--line); border-radius: 18px; overflow: hidden; background: #fff; }
  .theirs iframe { width: 100%; height: 72vh; border: 0; display: block; background: #fff; }
  .theirs .note { padding: 14px 18px; font-size: 13px; color: var(--soft); background: var(--panel);
                  border-bottom: 1px solid var(--line); }
  .theirs .note a { color: #fff; }

  .bar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 65; display: none; gap: 10px; padding: 10px 12px;
         background: rgba(7,9,13,.94); border-top: 1px solid var(--line); backdrop-filter: blur(10px); }
  .bar a { flex: 1; text-align: center; padding: 15px; border-radius: 14px; text-decoration: none; font-weight: 800; }
  .bar .a { background: var(--brand); color: var(--ink); }
  @media (max-width: 780px) {
    .bar { display: flex; }
    body { padding-bottom: 82px; }
    header .call { display: none; }
    .wa { bottom: 92px; }
    .hero { min-height: 72vh; }
    .stat { border-right: 0; border-bottom: 1px solid var(--line); padding: 26px 18px; }
    section { padding: 68px 0; }
  }
</style>
</head>
<body>

<div class="mock">
  <b>A mock-up built for ${esc(name)} by ${esc(from)}.</b>
  <span>Not a live website. This link stops working on ${esc(expires)}.</span>
</div>

${them.promo ? `<div class="promo">${esc(them.promo)}</div>` : ""}

<header><div class="inner">
  ${them.logo ? `<img src="${esc(them.logo)}" alt="${esc(name)}">` : `<div class="name">${esc(name)}</div>`}
  ${tel ? `<a class="call" href="tel:${esc(tel)}">${esc(them.phone)}</a>` : ""}
</div></header>

<div class="flip">
  <div class="set" role="group" aria-label="Which version to show">
    <button id="tab-after" aria-pressed="true">Rebuilt</button>
    <button id="tab-before" aria-pressed="false">Your site now</button>
  </div>
</div>

<section id="before"><div class="wrap">
  <h2>Your website as it is today</h2>
  <p class="lead">Loaded live from ${esc(website.replace(/^https?:\/\//, "").replace(/\/$/, ""))}. Nothing has been changed.</p>
  <div class="theirs">
    <div class="note">Some sites refuse to load inside another page. If the panel below is blank,
      <a href="${esc(website)}" target="_blank" rel="noreferrer noopener">open your site in a new tab</a>
      and put the two side by side.</div>
    <iframe src="${esc(website)}" title="Your current website" loading="lazy" referrerpolicy="no-referrer"></iframe>
  </div>
</div></section>

<div id="after">
<div class="hero">
  ${hero ? `<div class="shot" style="background-image:url('${esc(hero)}')"></div>` : `<div class="shot"></div>`}
  <div class="glow"></div>
  <div class="wrap">
    <div class="eyebrow rise"><span class="dot"></span> ${esc(name)}${them.since ? ` &middot; since ${esc(them.since)}` : ""}</div>
    <h1 class="rise">${esc(them.tagline && them.tagline.length < 70 ? them.tagline : name)}</h1>
    ${them.tagline && them.tagline.length >= 70 ? `<p class="rise">${esc(them.tagline)}</p>` : ""}
    <div class="btns rise">
      ${tel ? `<a class="btn" href="tel:${esc(tel)}">Call ${esc(them.phone)}</a>` : ""}
      <a class="btn ghost" href="https://wa.me/${esc(wa)}">Message on WhatsApp</a>
    </div>
  </div>
</div>

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
  <h2 class="rise">What we do</h2>
  <p class="lead rise">Taken from your own website, nothing added.</p>
  <div class="cards">
    ${them.services
      .map(
        (s, i) =>
          `<div class="card rise" style="transition-delay:${i * 60}ms"><div class="mark">${i + 1}</div><h3>${esc(s)}</h3></div>`,
      )
      .join("\n    ")}
  </div>
</div></section>`
    : ""
}

${
  gallery.length
    ? `<section><div class="wrap">
  <h2 class="rise">Our work</h2>
  <p class="lead rise">Your own photographs, shown properly.</p>
  <div class="shots">
    ${gallery
      .map(
        (src, i) =>
          `<figure class="rise" style="transition-delay:${i * 70}ms"><img src="${esc(src)}" alt="" loading="lazy"></figure>`,
      )
      .join("\n    ")}
  </div>
</div></section>`
    : ""
}

${
  them.about
    ? `<section><div class="wrap">
  <h2 class="rise">About ${esc(name)}</h2>
  <p class="about rise">${esc(them.about)}</p>
</div></section>`
    : ""
}

</div><!-- /after -->

<section class="fixes"><div class="wrap">
  ${score !== null ? `<div class="pill rise">Your website scored ${score} out of 100 on our audit</div>` : ""}
  <h2 class="rise">What we changed, and what it was costing you</h2>
  <p class="lead rise">Every one of these is on your site right now. Check them yourself.</p>
  ${findings
    .map(
      (f, i) =>
        `<div class="fix rise" style="transition-delay:${i * 50}ms"><span class="n">0${i + 1}</span><p>${esc(f)}</p></div>`,
    )
    .join("\n  ")}
</div></section>

<footer><div class="wrap">
  <div class="big rise">Want this one instead?</div>
  <div class="lead rise" style="margin:0 auto">Reply to the email, or ring ${esc(siteConfig.phoneDisplay)} and we will talk it through.</div>
  <div class="btns rise" style="justify-content:center;margin-top:26px">
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
  var rise = document.querySelectorAll('.rise');
  if (reduce || !('IntersectionObserver' in window)) {
    rise.forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('.num').forEach(function (el) { el.firstChild.nodeValue = el.dataset.to; });
    document.querySelector('.wa').classList.add('on');
    return;
  }

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

  // Counts to the real value, decimals kept, so 4.8 does not land on 5.
  function count(el) {
    var target = parseFloat(el.dataset.to);
    if (isNaN(target)) { el.firstChild.nodeValue = el.dataset.to; return; }
    var dp = (el.dataset.to.split('.')[1] || '').length;
    var started = null, ms = 1100;
    function step(now) {
      if (!started) started = now;
      var p = Math.min(1, (now - started) / ms);
      var eased = 1 - Math.pow(1 - p, 3);
      el.firstChild.nodeValue = (target * eased).toFixed(dp);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Their site against ours. Switching scrolls back to the top, because
  // landing halfway down the other version reads as the page breaking.
  var after = document.getElementById('after');
  var before = document.getElementById('before');
  var tabA = document.getElementById('tab-after');
  var tabB = document.getElementById('tab-before');
  function show(which) {
    var theirs = which === 'before';
    before.classList.toggle('on', theirs);
    after.style.display = theirs ? 'none' : '';
    tabB.setAttribute('aria-pressed', String(theirs));
    tabA.setAttribute('aria-pressed', String(!theirs));
    window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }
  tabA.addEventListener('click', function () { show('after'); });
  tabB.addEventListener('click', function () { show('before'); });

  // WhatsApp appears once they have started reading, not on arrival.
  var wa = document.querySelector('.wa');
  function onScroll() {
    if (window.scrollY > 420) wa.classList.add('on'); else wa.classList.remove('on');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
</script>

</body>
</html>`;
}

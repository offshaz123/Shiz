import type { Rebuilt } from "./site-rebuild";
import { siteConfig } from "./site-config";

/**
 * Their own website, rebuilt, as one page they can look at.
 *
 * Written as a string of HTML rather than as a React component on purpose.
 * This page has to borrow the business's own colour, carry their own
 * photographs, and be served on its own with nothing of ours around it,
 * which is a different job from every other page on this site.
 *
 * The rules it must never break, in order of how much trouble they save:
 *
 *  1. It says what it is, at the top, where nobody can miss it. A page
 *     carrying somebody's logo and photographs, sent to them unasked,
 *     has to be unmistakably a mock-up and unmistakably from us.
 *  2. Nothing on it is invented. Every word and every picture came off
 *     their own homepage or is left out.
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
  // Rough perceived brightness. Below halfway, white reads; above it, black.
  return (r * 299 + g * 587 + b * 114) / 1000 < 150 ? "#ffffff" : "#111111";
}

export function previewPage(input: PreviewInput): string {
  const { them, website, findings, score, expires, from } = input;
  const brand = /^#[0-9a-f]{6}$/i.test(them.colour) ? them.colour : "#1f6feb";
  const ink = inkOn(brand);
  const name = them.name || website.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const hero = them.images[0] ?? "";
  const rest = them.images.slice(1, 4);

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow, noarchive">
<title>${esc(name)}</title>
<style>
  :root { --brand: ${brand}; --ink: ${ink}; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
         color: #15181d; background: #fff; line-height: 1.55; }
  img { max-width: 100%; display: block; }
  .wrap { max-width: 1040px; margin: 0 auto; padding: 0 20px; }

  /* The bar that says what this is. Not dismissible. */
  .mock { background: #15181d; color: #fff; font-size: 13px; padding: 10px 20px; text-align: center; }
  .mock b { color: #fff; }
  .mock span { opacity: .75; }

  header { display: flex; align-items: center; gap: 16px; padding: 18px 20px; max-width: 1040px; margin: 0 auto; }
  header img { height: 44px; width: auto; }
  header .name { font-weight: 800; font-size: 20px; letter-spacing: -.01em; }
  header .call { margin-left: auto; background: var(--brand); color: var(--ink);
                 padding: 11px 18px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 15px; }

  .hero { position: relative; min-height: 460px; display: flex; align-items: center;
          background: #0d1117 center/cover no-repeat; color: #fff; }
  .hero::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(0,0,0,.82), rgba(0,0,0,.35)); }
  .hero .wrap { position: relative; z-index: 1; padding-top: 64px; padding-bottom: 64px; }
  .hero h1 { font-size: clamp(32px, 5vw, 52px); line-height: 1.07; margin: 0 0 16px; letter-spacing: -.02em; max-width: 16ch; }
  .hero p { font-size: 18px; max-width: 54ch; margin: 0 0 28px; opacity: .92; }
  .btns { display: flex; gap: 12px; flex-wrap: wrap; }
  .btn { background: var(--brand); color: var(--ink); padding: 15px 26px; border-radius: 12px;
         text-decoration: none; font-weight: 800; font-size: 17px; }
  .btn.ghost { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.35); }

  section { padding: 56px 0; }
  h2 { font-size: 26px; margin: 0 0 8px; letter-spacing: -.01em; }
  .lead { color: #5b6471; margin: 0 0 28px; max-width: 60ch; }
  .grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
  .card { border: 1px solid #e6e9ee; border-radius: 14px; padding: 20px; }
  .card h3 { margin: 0; font-size: 17px; }
  .card .tick { color: var(--brand); font-weight: 800; }
  .shots { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .shots img { border-radius: 14px; aspect-ratio: 4/3; object-fit: cover; width: 100%; }

  .band { background: #f6f8fa; }
  .about { max-width: 62ch; font-size: 17px; }

  /* What we changed, and why it was costing them. */
  .fixes { background: #0d1117; color: #fff; }
  .fixes h2 { color: #fff; }
  .fixes .lead { color: #9aa6b5; }
  .fix { display: flex; gap: 14px; padding: 16px 0; border-top: 1px solid #222a35; }
  .fix .n { color: var(--brand); font-weight: 800; font-size: 15px; min-width: 24px; }
  .fix p { margin: 0; color: #d6dde6; }
  .score { display: inline-block; border: 1px solid #39424f; border-radius: 999px;
           padding: 6px 14px; font-size: 13px; color: #9aa6b5; margin-bottom: 18px; }

  footer { padding: 44px 0 64px; text-align: center; color: #5b6471; font-size: 14px; }
  footer .big { font-size: 19px; color: #15181d; font-weight: 700; margin-bottom: 6px; }

  /* The call button that follows you down on a phone. */
  .sticky { position: fixed; left: 0; right: 0; bottom: 0; display: none; gap: 10px; padding: 10px;
            background: rgba(255,255,255,.96); border-top: 1px solid #e6e9ee; }
  .sticky a { flex: 1; text-align: center; padding: 14px; border-radius: 12px; text-decoration: none; font-weight: 800; }
  .sticky .a { background: var(--brand); color: var(--ink); }
  .sticky .b { background: #25d366; color: #fff; }
  @media (max-width: 760px) {
    .sticky { display: flex; }
    body { padding-bottom: 76px; }
    header .call { display: none; }
    .hero { min-height: 380px; }
  }
</style>
</head>
<body>

<div class="mock">
  <b>A mock-up built for ${esc(name)} by ${esc(from)}.</b>
  <span>Not a live website. This link stops working on ${esc(expires)}.</span>
</div>

<header>
  ${them.logo ? `<img src="${esc(them.logo)}" alt="${esc(name)}">` : `<div class="name">${esc(name)}</div>`}
  ${them.phone ? `<a class="call" href="tel:${esc(them.phone.replace(/\s+/g, ""))}">${esc(them.phone)}</a>` : ""}
</header>

<div class="hero"${hero ? ` style="background-image:url('${esc(hero)}')"` : ""}>
  <div class="wrap">
    <h1>${esc(name)}</h1>
    ${them.tagline ? `<p>${esc(them.tagline)}</p>` : ""}
    <div class="btns">
      ${them.phone ? `<a class="btn" href="tel:${esc(them.phone.replace(/\s+/g, ""))}">Call ${esc(them.phone)}</a>` : ""}
      ${them.email ? `<a class="btn ghost" href="mailto:${esc(them.email)}">Email us</a>` : ""}
    </div>
  </div>
</div>

${
  them.services.length
    ? `<section class="wrap">
  <h2>What we do</h2>
  <p class="lead">Taken from your own website, nothing added.</p>
  <div class="grid">
    ${them.services.map((s) => `<div class="card"><h3><span class="tick">&#10003;</span> ${esc(s)}</h3></div>`).join("\n    ")}
  </div>
</section>`
    : ""
}

${
  rest.length
    ? `<section class="band"><div class="wrap">
  <h2>Our work</h2>
  <p class="lead">Your own photographs, shown properly.</p>
  <div class="shots">
    ${rest.map((src) => `<img src="${esc(src)}" alt="" loading="lazy">`).join("\n    ")}
  </div>
</div></section>`
    : ""
}

${
  them.about
    ? `<section class="wrap">
  <h2>About ${esc(name)}</h2>
  <p class="about">${esc(them.about)}</p>
</section>`
    : ""
}

<section class="fixes"><div class="wrap">
  ${score !== null ? `<div class="score">Your website scored ${score} out of 100 on our audit</div>` : ""}
  <h2>What we changed, and what it was costing you</h2>
  <p class="lead">Every one of these is on your site right now. You can check them yourself.</p>
  ${findings
    .map(
      (f, i) =>
        `<div class="fix"><span class="n">${i + 1}</span><p>${esc(f)}</p></div>`,
    )
    .join("\n  ")}
</div></section>

<footer>
  <div class="big">Want this one instead?</div>
  <div>Reply to the email, or ring ${esc(siteConfig.phoneDisplay)}.</div>
  <div style="margin-top:18px;opacity:.75">Built by ${esc(from)} &middot; ${esc(siteConfig.url)}</div>
</footer>

<div class="sticky">
  ${them.phone ? `<a class="a" href="tel:${esc(them.phone.replace(/\s+/g, ""))}">Call now</a>` : ""}
  <a class="b" href="https://wa.me/${esc(siteConfig.whatsappNumber)}">WhatsApp us</a>
</div>

</body>
</html>`;
}

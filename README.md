# Shaz Marketing Group

Marketing website for **Shaz Marketing Group** — Meta & Instagram ads, lead generation, an
all-in-one CRM/social inbox, and an AI receptionist for businesses of every kind (with a
speciality in automotive).

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, and `next-themes` for the
dark/light theme toggle (dark is the default).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — Home: hero, services, how it works, unified inbox/CRM pitch, AI receptionist, pricing, FAQs, lead form
- `/about` — Who we are / company story
- `/contact` — Contact details (WhatsApp, phone, email) + full lead form
- `/blog` — SEO content hub (see below), `/blog/[slug]` for individual posts
- `/privacy` — Privacy policy

## Lead form → email delivery

The enquiry form (`src/components/LeadForm.tsx`) posts to `src/app/api/lead/route.ts`, a server
route that sends the submission by email via SMTP using `nodemailer` — through the existing
`info@shazmarketing.com` mailbox, no third-party form service involved. This requires the site to
run as a real Next.js server (not a static export), which is what Hostinger's Websites product
does.

**One-time setup — 4 environment variables**, from hPanel → Emails → the `info@shazmarketing.com`
mailbox → "Connect devices" / email client settings:

- `SMTP_HOST` — e.g. `smtp.hostinger.com`
- `SMTP_PORT` — usually `465`
- `SMTP_USER` — the mailbox address
- `SMTP_PASS` — the mailbox password

Set these in the Hostinger site's **Environment variables** panel (or `.env.local` for local dev)
and redeploy. Every submission (from the Home page, Contact page and /demo page) emails
`siteConfig.email` directly, with `replyTo` set to the enquirer's own address, and the visitor is
redirected to `/thank-you`. Without these set, the API route returns an error and the form shows
its built-in fallback message.

## Environment variables

Everything optional degrades quietly: a missing variable turns its feature off rather than
breaking a page. Set them in hPanel → the site → **Environment variables** (or `.env.local`
for local dev).

| Variable | Needed for | Without it |
| --- | --- | --- |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASS` | Sending enquiry emails and the follow-up sequence | Forms show their fallback message; no email sends |
| `DB_HOST` `DB_PORT` `DB_NAME` `DB_USER` `DB_PASS` | Storing scan leads, sent emails, reviews, page views | The site runs; nothing is stored and the admin lists are empty. **On Hostinger `DB_HOST` must be `127.0.0.1`, not `localhost`** |
| `ADMIN_PASSWORD` | Signing in at `/admin` | Admin can't be opened. Changing it signs every session out |
| `CRON_SECRET` | The follow-up email cron endpoint | `/api/cron/follow-ups` returns 503 and sends nothing |
| `CRON_SITE_URL` | `scripts/cron.js`, when run somewhere other than the live site | Defaults to the live site |
| `GOOGLE_PLACES_KEY` | The Google Business Profile section of the scanner, and `scripts/find-local-prospects.mjs` | The scanner leaves that section out entirely and scores exactly as it did before |
| `GOOGLE_PLACES_MONTHLY_BUDGET` `GOOGLE_PLACES_DAILY_BUDGET` | Capping Places lookups | Default to 900 a month and 60 a day — see below |
| `META_CONVERSIONS_API_TOKEN` | Server-side conversion events to Meta | Events aren't sent |
| `COMPANIES_HOUSE_KEY` | `scripts/find-prospects.mjs` | That script won't run |

### Google Places key

One-off, in [console.cloud.google.com](https://console.cloud.google.com):

1. Create a project
2. **APIs & Services** → enable **Places API (New)**
3. **Credentials** → create an API key
4. Restrict it to the Places API, and ideally to the server's IP
5. Set `GOOGLE_PLACES_KEY`

Billing has to be switched on. Also set a **daily quota** on the key: **APIs & Services** →
**Places API (New)** → **Quotas** → cap requests per day. That is a hard stop Google enforces,
and it is the one that matters.

**What it costs.** Google bills a Text Search request at the dearest tier of any field asked
for. The scanner asks for review counts, ratings and reviews, which puts it in the Enterprise +
Atmosphere tier: **1,000 free calls a month**, then $40 per thousand (Google's published
pay-as-you-go pricing, November 2026 — check before relying on it). There is no longer a
standing monthly dollar credit; Google replaced it with per-SKU free allowances, so "free"
means 1,000 calls rather than a sum of money.

A scan spends one call, or two when the first search finds no match. The defaults — 900 a
month, 60 a day — keep the site inside the free allowance even if the public audit form gets
hammered, and a scanned domain is cached for 24 hours so rescanning it costs nothing.

## WhatsApp

The floating WhatsApp button (`src/components/WhatsAppButton.tsx`) and all WhatsApp links use the
number configured in `src/lib/site-config.ts`. Update `whatsappNumber` there if the number ever
changes.

## Editing content

- Company contact details, phone & email: `src/lib/site-config.ts` — **`url` must always match the
  live domain**, since it drives canonical links, the sitemap, robots.txt, and Open Graph tags.
- Pricing tiers & features: `src/components/PricingSection.tsx` (keep `src/components/StructuredData.tsx`'s
  `makesOffer` prices in sync if these change)
- FAQs (shown on the homepage and marked up as FAQPage structured data): `faqs` array in
  `src/app/page.tsx`
- Logo: `src/components/Logo.tsx` (and `src/app/icon.svg` for the favicon)

## SEO

- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
  automatically from `siteConfig.url` — no manual editing needed as pages are added, just extend
  the `routes` array in `sitemap.ts`.
- `src/app/opengraph-image.tsx` generates the branded image shown when the site is shared on
  social media/messaging apps (Next.js's `next/og`, no static image file to maintain).
- `src/components/StructuredData.tsx` renders JSON-LD: `Organization`/`ProfessionalService`
  (site-wide, in `layout.tsx`), `FAQPage` (home page, from the `faqs` array in `page.tsx`), and
  `BreadcrumbList` + `BlogPosting` (on every blog post) — all feeding rich-snippet eligibility in
  Google.
- `/thank-you` is marked `noindex` (it's a transactional confirmation page, not something people
  should land on via search).
- `public/logo.png` and `src/app/apple-icon.png` are static square PNG exports of the logo mark —
  used as the Organization schema's `logo` (structured data requires a raster image, not the SVG
  favicon) and as the Apple touch icon for home-screen bookmarks respectively.
- The homepage has a "From the Blog" section (latest 3 posts) for internal linking + freshness
  signals as the daily blog grows.
- `html lang` is `en-GB` to match the UK targeting (GBP pricing, `en_GB` Open Graph locale).

## Blog / ongoing SEO content

- Blog posts live as data in `src/content/blog.ts` (a typed array — no CMS, no MDX). Each entry
  has a `slug`, `title`, `description`, `publishedAt`, `keywords`, and `sections` (optional
  heading + paragraphs + bullets). Add a new object to the top of the array to publish a new post.
- `/blog` (index) and `/blog/[slug]` (post template, in `src/app/blog/`) render straight from that
  array — `generateStaticParams` prerenders every post at build time, and each post gets its own
  canonical URL, meta description, and `BlogPosting` JSON-LD.
- New posts are automatically picked up by `sitemap.ts` — no separate step needed.
- A daily automated Routine (set up outside this repo, in Claude) writes one new post per day,
  picking a topic not already covered, and pushes directly to this branch, which triggers the
  GitHub Actions deploy below. It always runs `npm run lint` and `npm run build` before pushing.

## Deploy — Hostinger (Websites product, GitHub-connected)

Hostinger's "Websites" product (hpanel.hostinger.com → Websites) connects directly to a GitHub
branch and auto-builds/deploys on every push — no FTP, no GitHub Actions workflow needed. This is
the same setup already used for the SMG Details site in this repo.

**One-time setup, in hPanel:**

1. **Websites** → **Add website** (or similar "create/connect" button) → choose to connect a Git
   repository rather than starting from a template
2. Authorize/select GitHub, choose the `Shiz` repo, and set the branch to
   `claude/meta-ads-instagram-website-p2ah5o`
3. Framework should auto-detect as Next.js. Set the environment variables listed above in the
   site's **Environment variables** panel — at minimum the four `SMTP_*` ones, so the lead form
   can send
4. Deploy — Hostinger gives it a temporary `*.hostingersite.com` URL first
5. Once it's working, go to **Domains** → **Connect domain** and point `shazmarketing.com` at it

This site runs as a real Next.js server, not a static export: the lead form, the scanner,
the admin pages, the database and the follow-up cron all need server-side code. Hostinger's
Websites product serves it with Node, which is what makes that possible.

# Exclusive Tints & Repairs

Website for **Exclusive Tints & Repairs** — premium window tinting (standard dyed, ceramic and
chameleon tint, plus dechroming) and vehicle repairs & servicing (brakes, oil changes).

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, and `next-themes` for the
dark/light theme toggle (dark is the default). A black & white base theme is paired with a
user-selectable accent colour (gold by default) via the picker in the header.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — Home: hero, promo strip, why choose us, tints & repairs overview, FAQs, blog, lead form
- `/tints` — Standard dyed, ceramic and chameleon window tints, plus dechroming
- `/repairs` — Brakes, minor service (oil & filter) and major service (all filters + oil)
- `/quote` — Quote form with contact sidebar (phone, WhatsApp, email, opening hours); accepts
  `?service=` to preselect a service
- `/pricing` — Full price list for tints and repairs
- `/about` — Company story
- `/contact` — Contact details + full lead form
- `/blog` — SEO content hub (see below), `/blog/[slug]` for individual posts
- `/privacy` — Privacy policy

## Lead form → email delivery

The enquiry form (`src/components/LeadForm.tsx`) posts to `src/app/api/lead/route.ts`, a server
route that sends the submission by email via SMTP using `nodemailer`. This requires the site to
run as a real Next.js server (not a static export).

**One-time setup — 4 environment variables**, from your email provider's SMTP/"connect a device"
settings for the `siteConfig.email` mailbox:

- `SMTP_HOST` — e.g. `smtp.gmail.com`
- `SMTP_PORT` — usually `465`
- `SMTP_USER` — the mailbox address
- `SMTP_PASS` — the mailbox password (for Gmail, an App Password)

Set these in the hosting platform's environment variables panel (or `.env.local` for local dev)
and redeploy. Every submission emails `siteConfig.email` directly, with `replyTo` set to the
enquirer's own address, and the visitor is redirected to `/thank-you`. Without these set, the API
route returns an error and the form shows its built-in fallback message.

## WhatsApp

The floating WhatsApp button (`src/components/WhatsAppButton.tsx`), the header's "WhatsApp Us"
link, and the quote/contact sidebar all use the number configured in `src/lib/site-config.ts`.
Update `whatsappNumber` there if the number ever changes.

## Accent colour picker

`src/lib/accents.ts` defines the swatch palette; `src/components/AccentPicker.tsx` (in the header)
lets a visitor pick one, which sets the `--brand` CSS variable and persists it to `localStorage`
(`etr-accent`) so it survives reloads and theme toggles. A small inline script in `layout.tsx`
applies the stored choice before first paint to avoid a flash of the default gold.

## Editing content

- Contact details, address, opening hours: `src/lib/site-config.ts` — **`url` must always match
  the live domain**, since it drives canonical links, the sitemap, robots.txt, and Open Graph tags.
- Tint & repair services, descriptions, features and prices: `tintServices` / `repairServices` in
  `src/lib/site-config.ts` — both `/tints`/`/repairs` and the homepage/pricing page render
  straight from these arrays.
- Promo banner messages: `promos` array in `src/components/PromoBanner.tsx`.
- FAQs (homepage & pricing page, marked up as FAQPage structured data): `faqs` arrays in
  `src/app/page.tsx` and `src/app/pricing/page.tsx`.
- Logo: `src/components/Logo.tsx` (and `src/app/icon.svg` / `src/app/apple-icon.tsx` for
  favicons).

## SEO

- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt`
  automatically from `siteConfig.url` — no manual editing needed as pages are added, just extend
  the `routes` array in `sitemap.ts`.
- `src/app/opengraph-image.tsx` generates the branded image shown when the site is shared on
  social media/messaging apps (Next.js's `next/og`, no static image file to maintain).
- `src/components/StructuredData.tsx` renders JSON-LD: `AutoRepair` (site-wide, in `layout.tsx`),
  `FAQPage` (home & pricing pages), and `BreadcrumbList` + `BlogPosting` (on every blog post) —
  all feeding rich-snippet eligibility in Google.
- `/thank-you` is marked `noindex` (it's a transactional confirmation page, not something people
  should land on via search).
- `html lang` is `en-GB` to match the UK targeting (GBP pricing, `en_GB` Open Graph locale).

## Blog / ongoing SEO content

- Blog posts live as data in `src/content/blog.ts` (a typed array — no CMS, no MDX). Each entry
  has a `slug`, `title`, `description`, `publishedAt`, `keywords`, and `sections` (optional
  heading + paragraphs + bullets). Add a new object to the top of the array to publish a new post.
- `/blog` (index) and `/blog/[slug]` (post template, in `src/app/blog/`) render straight from that
  array — `generateStaticParams` prerenders every post at build time, and each post gets its own
  canonical URL, meta description, and `BlogPosting` JSON-LD.
- New posts are automatically picked up by `sitemap.ts` — no separate step needed.

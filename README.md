# Executive Tints & Repairs

Website for **Executive Tints & Repairs** — premium window tinting (standard dyed, ceramic and
chameleon tint, plus dechroming), and vehicle repairs, servicing & detailing (brakes, oil changes,
machine polishing, ceramic detailing, number plates).

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, and `next-themes` for the
dark/light theme toggle (dark is the default). The colour theme (Ocean Blue → Cyan → Amber
gradient, matching the SMG Details site) is paired with a user-selectable theme picker in the
header, letting visitors switch to one of several other gradient presets.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pages

- `/` — Home: hero, promo strip, why choose us, tints & repairs overview, FAQs, blog, lead form
- `/tints` — Standard dyed, ceramic and chameleon window tints, plus dechroming
- `/repairs` — Brakes, servicing, polishing (stages 1–3 + bundle), ceramic detailing, and a link
  through to `/number-plates`
- `/number-plates` — Standard/3D/3D Gel/4D/4D Gel/5D/5D Gel finishes, plate shapes, comparison table
- `/quote` — Quote form with contact sidebar (phone, WhatsApp, email, opening hours); accepts
  `?service=` to preselect a service
- `/pricing` — Full price list for tints, repairs, servicing, polishing and detailing
- `/about` — Company story
- `/contact` — Contact details + full lead form
- `/blog` — SEO content hub (see below), `/blog/[slug]` for individual posts
- `/privacy` — Privacy policy
- `/kent` — PPC landing page for Google/Meta ads (Kent geo-targeting), minimal header/footer,
  `noindex`d since it's not meant to rank organically

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

## Colour theme picker

`src/lib/accents.ts` defines the gradient theme presets (`--brand-purple` / `--brand-pink` /
`--brand-orange`, with `--color-brand` aliased to the middle stop for solid accent uses like links
and badges); `src/components/AccentPicker.tsx` (in the header) lets a visitor pick one, which sets
those three CSS variables and persists the choice to `localStorage` (`etr-accent-theme`) so it
survives reloads and theme toggles. A small inline script in `layout.tsx` applies the stored
choice before first paint to avoid a flash of the default Ocean Blue.

## Ad tracking (Google Ads / Meta Pixel)

`src/lib/site-config.ts`'s `trackingConfig` holds four IDs, all empty by default:
`googleAdsConversionId`, `googleAdsConversionLabel`, `ga4MeasurementId`, `metaPixelId`.
`src/components/GoogleTag.tsx` and `src/components/MetaPixel.tsx` (both loaded site-wide in
`layout.tsx`) render nothing until their relevant ID is filled in. Once configured,
`src/components/ConversionTracker.tsx` (mounted on `/thank-you`) fires the Google Ads conversion
event and the Meta `Lead` event after a successful form submission — see the "Kent landing page &
ad tracking" section below for the full setup checklist.

## Editing content

- Contact details, address, opening hours: `src/lib/site-config.ts` — **`url` must always match
  the live domain**, since it drives canonical links, the sitemap, robots.txt, and Open Graph tags.
- Tint & repair services, descriptions, features and prices: `tintServices` / `repairServices` in
  `src/lib/site-config.ts` — both `/tints`/`/repairs` and the homepage/pricing page render
  straight from these arrays. Polishing stage pricing lives in `polishStages`, the ceramic
  detailing + Stage 2 bundle in `detailingBundle`, and number plate finishes/shapes in
  `numberPlateFinishes` / `numberPlateShapes`.
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

## Kent landing page & ad tracking setup

`/kent` is a stripped-down, form-first landing page built for Google Ads / Meta Ads traffic
(minimal header — logo + call button only, no main nav) and is marked `noindex` so it doesn't
compete with the main site in organic search. Before running paid traffic to it:

1. **Google Ads conversion tracking** — create a conversion action in Google Ads, get its
   Conversion ID (`AW-XXXXXXXXX`) and label, and set `googleAdsConversionId` /
   `googleAdsConversionLabel` in `trackingConfig` (`src/lib/site-config.ts`).
2. **Meta Pixel** — create a pixel in Meta Events Manager, get its Pixel ID, and set
   `metaPixelId` in `trackingConfig`. This also enables the sitewide Meta Pixel (not just on
   `/kent`), so Meta ads pointing anywhere on the site get tracked.
3. **GA4 (optional but recommended)** — set `ga4MeasurementId` so you can see landing page
   behaviour (bounce rate, time on page) outside of the ad platforms themselves.
4. **Google Ads / Meta linking** — link the Google Ads and Meta Business accounts to this
   domain's Google Search Console / Meta Business verification if you want enhanced conversions
   or broader audience matching (optional, done in each platform's UI, not in this codebase).
5. **UTM parameters** — tag your ad URLs (e.g. `?utm_source=google&utm_medium=cpc&utm_campaign=kent`)
   so GA4 can attribute traffic correctly; no code changes needed for this.
6. **Cookie consent** — once tracking is live, the `/privacy` page should be reviewed to ensure it
   discloses the ad pixels/cookies in use (UK GDPR/PECR requires this for non-essential tracking
   cookies like Meta Pixel and Google Ads).
7. Redeploy after setting the environment/config values above — the tracking components render
   nothing until their IDs are filled in, so it's safe to leave them blank until you're ready to
   launch.

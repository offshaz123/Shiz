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

The enquiry form (`src/components/LeadForm.tsx`) submits directly to **[Web3Forms](https://web3forms.com)**
— a free third-party form-to-email service, chosen because the site is statically exported
(`output: "export"` in `next.config.ts`) and has no backend/API routes of its own.

**One-time setup:**

1. Go to [web3forms.com](https://web3forms.com), enter the destination inbox
   (`info@shazmarketing.com`) and create a free access key.
2. Set it as `NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY` at build time (local `.env.local`, or as a
   `WEB3FORMS_ACCESS_KEY` secret in the GitHub Actions deploy workflow — see below). It's baked
   into the static JS bundle at build time, which is expected/fine for this service (the key only
   authorizes submissions *to* your inbox, same model as Formspree's public form IDs).

Every submission (from the Home page and Contact page) emails the configured inbox directly, and
the visitor is redirected to `/thank-you`. Without the access key set, submissions will fail
client-side with the form's built-in error message.

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

## Deploy — Hostinger (shared hosting)

This is a static export (`output: "export"`), so the build produces a plain `out/` folder of
HTML/CSS/JS that any shared host can serve — no Node.js server required on Hostinger.

```bash
npm run build   # outputs static site to ./out
```

**Automated deploy:** `.github/workflows/deploy-hostinger.yml` builds and FTP-uploads `out/` to
`public_html/` on every push to this branch. Requires these GitHub repo secrets
(Settings → Secrets and variables → Actions):

- `HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD` — from hPanel →
  Files → FTP Accounts
- `WEB3FORMS_ACCESS_KEY` — from web3forms.com (see Lead form section above)

**Manual deploy (one-off / first time):** run `npm run build` locally, then upload the contents
of `out/` into `public_html/` via hPanel's File Manager (zip it first, upload, extract) or an
FTP client like FileZilla.

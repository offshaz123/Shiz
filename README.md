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

- `/` — Home: hero, services, how it works, unified inbox/CRM pitch, AI receptionist, pricing, lead form
- `/about` — Who we are / company story
- `/contact` — Contact details (WhatsApp, phone, email) + full lead form
- `/privacy` — Privacy policy

## Lead form → email delivery

The enquiry form (`src/components/LeadForm.tsx`) uses **Netlify Forms** — no API keys, no
app passwords, no backend code required.

Modern Next.js apps route every page through a serverless function, so Netlify's build-time form
scanner can't detect a form declared directly on a Next.js page — `@netlify/plugin-nextjs` will
actually fail the build if you try. To work around this, there's a small "shadow" static file,
`public/__forms.html`, that mirrors the same fields with `data-netlify="true"` and a `form-name`
field. Netlify detects the form from that plain static file (which bypasses the Next.js function
entirely), and the real form on the website submits to it in the background via `fetch`. If you
ever add/remove/rename a field in `LeadForm.tsx`, mirror the same change in `public/__forms.html`
or Netlify's copy of the form definition will get out of sync with what's actually submitted.

**Required one-time setup (only works once the site is deployed on Netlify):**

1. Deploy the branch with this form to Netlify at least once (Netlify needs to scan a deploy
   to detect the form).
2. In the Netlify dashboard, open your site → left sidebar → **Forms**. You should see
   `lead-inquiry` listed once a deploy has picked it up.
3. Click **Form notifications** (or **Settings and usage** → **Form notifications**, depending
   on your Netlify UI version) → **Add notification** → **Email notification**.
4. Enter `info@shazmarketing.com` and save.

That's it — every submission (from the Home page and Contact page) now emails you directly, and
the visitor is redirected to `/thank-you`. You can also see every submission logged in the Forms
tab even if an email is somehow missed.

Netlify Forms only works when the site is actually hosted on Netlify — locally (`npm run dev`)
or on other hosts (Vercel, etc.), the form will submit without errors but nothing will be
captured or emailed, since there's no Netlify bot to intercept it.

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
- `src/components/StructuredData.tsx` renders JSON-LD: an `Organization`/`ProfessionalService`
  schema (site-wide, in `layout.tsx`) and an `FAQPage` schema (home page only, from the `faqs`
  array in `page.tsx`) for rich snippet eligibility in Google.
- `/thank-you` is marked `noindex` (it's a transactional confirmation page, not something people
  should land on via search).

## Deploy

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/new)):

```bash
npm run build
npm run start
```

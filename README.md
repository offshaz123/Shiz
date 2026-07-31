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
app passwords, no backend code required. The form has `data-netlify="true"` and a
`form-name` field, which Netlify detects automatically at deploy time; submissions are then
captured by Netlify and can be emailed to you straight from their dashboard.

**Required one-time setup (only works once the site is deployed on Netlify):**

1. Deploy the branch with this form to Netlify at least once (Netlify needs to scan a deploy
   to detect the form).
2. In the Netlify dashboard, open your site → left sidebar → **Forms**. You should see
   `lead-inquiry` listed once a deploy has picked it up.
3. Click **Form notifications** (or **Settings and usage** → **Form notifications**, depending
   on your Netlify UI version) → **Add notification** → **Email notification**.
4. Enter `walid.shah2003@gmail.com` and save.

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

- Company contact details, phone & email: `src/lib/site-config.ts`
- Pricing tiers & features: `src/components/PricingSection.tsx`
- Logo: `src/components/Logo.tsx` (and `src/app/icon.svg` for the favicon)

## Deploy

Deploy like any Next.js app (e.g. [Vercel](https://vercel.com/new)):

```bash
npm run build
npm run start
```

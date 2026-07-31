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

The enquiry form (`src/components/LeadForm.tsx`) submits to a first-party API route,
`src/app/api/lead/route.ts`, which sends the notification email via
[Resend](https://resend.com) to:

```
walid.shah2003@gmail.com
```

Using a first-party route (instead of calling a third-party service straight from the browser)
avoids the submission being silently dropped by ad-blockers or privacy extensions.

**Required one-time setup — the site will not send emails until you do this:**

1. Sign up at [resend.com](https://resend.com) using **walid.shah2003@gmail.com** as the account
   email (this lets you send test emails to that address immediately, with no domain
   verification needed).
2. In the Resend dashboard, go to **API Keys → Create API Key** and copy it.
3. Add it as an environment variable on your host:
   - **Netlify:** Site configuration → Environment variables → Add variable →
     Key: `RESEND_API_KEY`, Value: *(paste the key)* → Save.
   - **Vercel:** Project Settings → Environment Variables → add the same key/value.
4. Trigger a redeploy so the new environment variable is picked up.

Once that's done, every form submission (Home page and Contact page) emails
walid.shah2003@gmail.com directly, and the visitor is redirected to `/thank-you`.

If you later verify your own domain in Resend, update the `from` address in
`src/app/api/lead/route.ts` to send from `@yourdomain.com` instead of the default
`onboarding@resend.dev`.

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

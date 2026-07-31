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

The enquiry form (`src/components/LeadForm.tsx`) submits to
[FormSubmit](https://formsubmit.co)'s AJAX endpoint, which forwards every submission straight to:

```
walid.shah2003@gmail.com
```

**Important one-time step:** the first time the form is submitted on the live site, FormSubmit
sends a confirmation email to that inbox — the link in it must be clicked once to activate
delivery for the domain. After that, every submission is emailed automatically with no server,
API keys, or backend required.

If you'd prefer a different email provider (Resend, SendGrid, a GoHighLevel webhook, etc.), swap
the `fetch` target in `LeadForm.tsx` for your provider's endpoint.

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

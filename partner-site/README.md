# Partner site — white-label business payment accounts

A self-contained marketing site for the white-label banking brand: business payment
accounts sold under our own brand on a UK-regulated partner's licence, plus the
remittance platform sold to licensed money service businesses.

It is a **separate Next.js app** from the Shaz Marketing Group site in the repository
root. Separate `package.json`, separate `node_modules`, separate build, separate
domain. Nothing here is imported by the root app and nothing there is imported by
this one — the root `tsconfig.json` and `eslint.config.mjs` both exclude this folder
so the two builds never touch each other.

## Getting started

```bash
cd partner-site
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## First job: the brand

`src/lib/brand.ts` holds **everything** brand-specific — name, legal name, domain,
email, phone, address, socials — and every page, the metadata, the sitemap, the
structured data and the enquiry emails read from it.

The name currently in there (`Northgate Payments`) is a **placeholder**. Register the
real name at Companies House, secure the domain, then change that one file.

Two more values in the same file need confirming with CoBanq before go-live:

- `provider.regulatedEntity` — the exact legal name of the regulated firm the accounts
  are provided under.
- `provider.firmReferenceNumber` — that firm's FCA firm reference number.

Until both are filled in, `RegulatoryNote` renders wording that does not name a firm
or an FRN. That is deliberate: an unverified FRN on a payments website is worse than
no FRN at all.

## Pages

- `/` — Home: the problem, collect/convert/pay, the four sectors, pricing posture, FAQs, enquiry form
- `/business-accounts` — the product in detail, the currencies, and a plain "what this is not"
- `/who-we-serve` and `/who-we-serve/[slug]` — one page per target sector, generated from `src/content/sectors.ts`
- `/opening-an-account` — the four steps and the full document checklist
- `/software` — the remittance platform for licensed MSBs, with the integrations named
- `/about`, `/contact`, `/privacy`, `/thank-you`

## Enquiry form → email

`src/components/EnquiryForm.tsx` posts to `src/app/api/enquiry/route.ts`, which sends
the enquiry by email over SMTP using `nodemailer`, to `brand.email`, with `replyTo`
set to the enquirer. This needs the site to run as a real Next.js server, not a static
export.

Four environment variables, from the mailbox's "connect devices" / email client settings:

- `SMTP_HOST` — e.g. `smtp.hostinger.com`
- `SMTP_PORT` — usually `465`
- `SMTP_USER` — the mailbox address
- `SMTP_PASS` — the mailbox password

Set them in the host's environment variables panel (or `.env.local` for local dev).
Without them the route returns an error and the form shows its fallback message.

## Editing content

- Sectors (the `/who-we-serve` pages, the homepage cards, the footer links and the form's
  business-type list): `src/content/sectors.ts`. Add an entry and it appears in all of
  them, including the sitemap.
- The collect/convert/pay pillars, the onboarding checklist and the FAQs:
  `src/content/site.ts`. The FAQs are also published as `FAQPage` structured data.
- Colours and the hero animation: `src/app/globals.css`. The palette is defined once as
  CSS custom properties per theme and surfaced to Tailwind through `@theme inline`.

## Things the copy deliberately does not say

The site never claims we hold a licence, never promises approval, and never publishes
an account rate card. Those are not omissions to be tidied up later:

- We are an introducer and service partner; the regulated firm decides every
  application. `RegulatoryNote` says so on the home, accounts, about and onboarding
  pages, and in the footer.
- Safeguarded funds are not FSCS-protected, and the site says that in plain words.
- Account pricing is quoted against what the customer pays today, which only works in
  a conversation. The software line does publish "from" prices — set
  `brand.software.showPricing` to `false` to take those off the page too.

## Deploy

Same pattern as the root site: Hostinger's Websites product connects to a GitHub
branch and builds on push. Point a second site at this repository with
`partner-site` as the root directory (or the base directory / subdirectory setting,
depending on what the panel calls it), set the four SMTP variables, and connect the
brand's domain once the temporary URL is working.

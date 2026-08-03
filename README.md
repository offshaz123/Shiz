# SMG Details

Website + admin panel for **SMG Details** (Shaz Motor Group Details) — car window tinting &
wrapping, dechroming, home/commercial/shop tinting, car servicing, custom 3D/4D/gel number
plates, and alloy wheel & caliper refurbishment, based in Romford.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, `next-themes` for the dark/light
toggle, a MySQL-backed admin panel, and a Claude-powered AI chat assistant.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without the environment variables below,
the public site works fully, but the enquiry form, admin panel and AI chat assistant will show
friendly "not configured yet" errors until you set them up.

## Environment variables

Copy `.env.example` to `.env.local` for local development. On Hostinger, set the same variables
in your Node.js app's environment settings (hPanel → Websites → your site → Node.js → your app →
**Environment variables**).

| Variable | Required for | Notes |
| --- | --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Admin panel, enquiry form, chat logging | Create a MySQL database in hPanel → **Databases → MySQL Databases**. The app creates its own tables automatically on first use — no migration step needed. |
| `ADMIN_PASSWORD_HASH` | Admin login | A bcrypt hash of your admin password (see below). Preferred over `ADMIN_PASSWORD`. |
| `ADMIN_PASSWORD` | Admin login (dev fallback) | Plain-text password, only used if `ADMIN_PASSWORD_HASH` isn't set. Fine for local dev, avoid in production. |
| `SESSION_SECRET` | Admin login | Random 32+ character string used to sign admin session cookies. Generate with `openssl rand -base64 32`. |
| `ANTHROPIC_API_KEY` | AI chat assistant | From the [Anthropic Console](https://console.anthropic.com/). Without this, the chat widget shows a "not configured" message. |
| `CHAT_MODEL` | AI chat assistant (optional) | Defaults to `claude-opus-5`. Override if you want to use a different/cheaper model. |

### Generating an admin password hash

```bash
node -e "require('bcryptjs').hash(process.argv[1], 10).then(console.log)" "your-password-here"
```

Paste the output into `ADMIN_PASSWORD_HASH`.

## Deploying on Hostinger

This app is built as a standard Next.js app (App Router + Route Handlers), meant to run via
Hostinger's **Node.js** hosting (or a VPS), with the MySQL database on the same account.

1. In hPanel, create a MySQL database and a database user under **Databases → MySQL Databases**,
   and note the host/port/user/password/database name.
2. Set up a Node.js application (hPanel → **Websites → Node.js**), pointing it at this repo.
   Startup file: whatever Hostinger's Node.js app runner expects to run `npm run build && npm
   run start` (Hostinger's Node.js panel runs `npm install` and your start command — check the
   current hPanel docs for the exact field names, as they change between hPanel versions).
3. Add all the environment variables above in the app's environment settings.
4. Deploy / restart the app. On first request, the app automatically creates the `enquiries` and
   `chat_messages` tables in your MySQL database — no manual schema step needed.
5. Visit `/admin/login` and sign in with your `ADMIN_PASSWORD_HASH` password.

If `DB_HOST` is on the *same* Hostinger account as the app, no extra network config is needed.

## Admin panel

- `/admin/login` — password login (single shared admin password via `ADMIN_PASSWORD_HASH`)
- `/admin` — dashboard: totals, enquiries by channel/status/service, a 14-day trend, AI chat
  session count, and recent enquiries
- `/admin/enquiries` — every enquiry (website form, AI chat, and manually-logged phone calls /
  WhatsApp messages / walk-ins), with status tracking (New → Contacted → Booked → Completed) and
  a "Log a call or message" button for the team to record inbound calls/WhatsApp messages by hand

All `/admin/*` routes are protected by `src/proxy.ts` (Next.js's request-time route guard) plus a
server-side check in the admin layout.

## AI chat assistant

The floating chat bubble (bottom-left, `src/components/ChatWidget.tsx`) calls
`POST /api/chat`, which uses the Anthropic Claude API (`src/app/api/chat/route.ts`) with a system
prompt built from the services and FAQ content (`src/lib/chat-prompt.ts`) — so it only answers
questions about SMG Details' actual services, hours and contact details. It doesn't take
bookings or give firm prices; it points visitors to WhatsApp or the contact form for those.
Conversations are logged to the `chat_messages` table (best-effort — a logging failure never
breaks the chat).

## WhatsApp & socials

- WhatsApp button (bottom-right, `src/components/WhatsAppButton.tsx`) and all WhatsApp links use
  `whatsappNumber` in `src/lib/site-config.ts`.
- Instagram/Facebook/TikTok links live in `siteConfig.socials` in the same file — shown in the
  footer.

## Editing content

- Business details (name, address, phone, WhatsApp, email, socials, opening hours):
  `src/lib/site-config.ts` — **`url` must match the live domain** once you have one, since it
  drives canonical links, the sitemap, robots.txt and Open Graph tags.
- Services & sub-services (shown on the homepage, `/services`, and fed into the AI assistant's
  knowledge): `src/content/services.ts`
- FAQs (shown on the homepage and fed into the AI assistant): `src/content/faqs.ts`
- Logo: `src/components/Logo.tsx` (and `src/app/icon.svg` for the favicon — `public/logo.png` and
  `src/app/apple-icon.png` are placeholder raster exports; swap them for real branded assets when
  you have them)

## Lead capture

The contact form (`src/components/LeadForm.tsx`) posts straight to `POST /api/enquiries`, which
writes to the `enquiries` table in MySQL — no third-party form service involved. Every submission
shows up immediately in `/admin/enquiries`.

## SEO

- `src/app/sitemap.ts` / `src/app/robots.ts` generate `/sitemap.xml` and `/robots.txt` from
  `siteConfig.url`.
- `src/app/opengraph-image.tsx` generates the social share image.
- `src/components/StructuredData.tsx` renders JSON-LD: `AutomotiveBusiness` (site-wide, with
  address & opening hours), `FAQPage` (homepage), and `BreadcrumbList`.
- `/admin/*` and `/thank-you` are excluded from `robots.txt` / marked `noindex`.
- `html lang` is `en-GB` for UK targeting.

## Deploy (generic / non-Hostinger)

The app also runs anywhere that supports a Next.js Node server, as long as `DB_HOST` can reach a
MySQL server (enable Hostinger's **Remote MySQL** access if the app and database aren't on the
same host):

```bash
npm run build
npm run start
```

# PlatedUp

Website for PlatedUp: road-legal number plates (Standard, 3D Gel, 4D 3MM, 4D 5MM, 5MM Gel, 7MM Gel), standard car size.

## What's in it

- **Plate builder** (`/design`) with live front/rear preview, 3 simple tabs (Plates, Style, Extras), price summary and a same-day dispatch countdown.
- **Basket and checkout** with V5C/ID upload (or "upload later"), delivery choice and order email to the shop.
- **Upload Documents** page for customers who upload after ordering.
- Product pages for 2D, 3D Gel and 4D plates, FAQs, About, Legal & Compliance, Contact, and Delivery / Returns / Terms / Privacy policies.

## Change your details and prices

- Business details (email, WhatsApp, address, **postcode printed on plates**, opening hours): `src/lib/site.ts`
- Plate styles, prices, extras and delivery prices: `src/lib/plates.ts` (prices in pence, so 2999 = £29.99)
- FAQs and product page text: `src/lib/content.ts`
- Logo: `src/components/Logo.tsx` draws the logo. To use your own artwork, put it at `public/logo.png` and swap the component for an `<img>`.

## Orders, payments and emails

1. The customer checks out. The order and their V5C/ID are saved in the database as **Awaiting payment** and they go to Stripe to pay.
2. When Stripe confirms the money (webhook, or the thank-you page checking Stripe directly), the order becomes **Paid** with the card brand and last 4 digits.
3. Only then are two emails sent: one to the shop (`ORDERS_EMAIL`, documents attached, amount and card) and a branded receipt to the customer with a picture of their plate.

## Accounts and admin

- Customers sign up / log in from the header and see **My Orders** and **Account Details**.
- The shop owner logs in on the same Login page with `ADMIN_EMAIL` / `ADMIN_PASSWORD` and lands in the **admin portal** (`/admin`): takings, orders to make, missing documents, every order with payment status and dates, customers, and order pages with documents and status buttons.

## Settings (Hostinger → website → Environment variables)

See `.env.example` for the full list:

- **Database:** `DB_HOST` (usually `localhost`), `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`. Tables are created automatically.
- **Email:** `ORDERS_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (Stripe → Developers → Webhooks → endpoint `https://YOUR-SITE/api/stripe/webhook`, events `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.expired`). For endpoints on both `platedup.co.uk` and `www.platedup.co.uk`, put both signing secrets in `STRIPE_WEBHOOK_SECRET`, separated by a comma.
- **Admin:** `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- **Address suggestions (optional):** `GOOGLE_MAPS_API_KEY` with Places API (New) enabled. Without it, typing a postcode still fills in the town (free postcodes.io lookup).
- `NEXT_PUBLIC_SITE_URL`, e.g. `https://platedup.co.uk`

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

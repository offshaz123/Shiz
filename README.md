# PlatedUp

Website for PlatedUp: road-legal number plates (Standard, 3D Gel, 4D 3MM, 4D 5MM, 5MM Gel, 7MM Gel), standard car size.

## What's in it

- **Plate builder** (`/design`) with live front/rear preview, 3 simple tabs (Plates, Style, Extras), price summary and a same-day dispatch countdown.
- **Basket and checkout** with V5C/ID upload (or "upload later"), delivery choice and order email to the shop.
- **Upload Documents** page for customers who upload after ordering.
- Product pages for 2D, 3D Gel and 4D plates, FAQs, About, Legal & Compliance, Contact, and Delivery / Returns / Terms / Privacy policies.

## Change your details and prices

- Business details (phone, email, WhatsApp, address, **postcode printed on plates**, opening hours): `src/lib/site.ts`
- Plate styles, prices, extras and delivery prices: `src/lib/plates.ts` (prices in pence, so 2999 = £29.99)
- FAQs and product page text: `src/lib/content.ts`
- Logo: `src/components/Logo.tsx` draws the logo. To use your own artwork, put it at `public/logo.png` and swap the component for an `<img>`.

## Orders

Orders, document uploads and contact messages are emailed to you with the documents attached. Set these environment variables on your host (see `.env.example`):

- `ORDERS_EMAIL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`
- `STRIPE_SECRET_KEY` (optional) to take card payments with Stripe Checkout. Without it, orders come through unpaid and you send the customer a payment link.
- `NEXT_PUBLIC_SITE_URL`, e.g. `https://platedup.co.uk`

## Run it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

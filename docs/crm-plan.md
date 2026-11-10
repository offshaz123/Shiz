# CRM / client platform — plan

Standing project. Walid's intent (10 Nov 2026): build our own tooling so the
agency runs on automation rather than memory, then turn the useful parts into
something clients log into. Reviewed and extended as we go, not built in one
push.

The shape he described: calendar, call tracking and recording, missed-call
text-back, every inbox in one place, connected Meta and social accounts,
performance dashboards showing cost per call and per enquiry, automations, an
AI assistant inside the app, eventually a mobile app. In his words, a
GoHighLevel alternative that an ordinary business owner can log into and
understand.

## The decision that comes before any of it

GoHighLevel's published 2026 pricing is **$97 Starter (3 sub-accounts),
$297 Unlimited, $497 Agency Pro (SaaS mode, resell under our own brand)**.

The number that matters: **$297 is not per client.** One fee covers every
client account. At three Google Ads clients on £600/month that is about 13%
of revenue for the whole stack, and SaaS mode at $497 can be billed on to
clients and run profit-positive from the first one.

So "GHL costs £250/month" is not an argument for building a GHL replacement.
Building one is a multi-year product effort, and the hard part is not the
features — it is the integrations and the approvals behind them.

What is worth building is the narrow slice that is genuinely ours: the
internal tooling, and later a simple client dashboard that does the handful
of things our clients actually look at.

Sources to re-check before committing, because affiliate content dominates
the search results: gohighlevel.com/pricing.

## Phase 0 — what already exists (do not rebuild)

Already shipped and running in this repo:

- `scan_leads` — leads, with source
- `prospects` — pipeline with status and notes, plus `/admin/prospects`
- `lead_emails` + `send-follow-up.ts` — automated day 1/3/6 sequences, with
  per-step dedupe at the database level and one-click unsubscribe tokens
- `google-business.ts` — Google Places prospect sourcing, budget-capped
- `site-audit.ts` — the website scanner, which is the lead magnet
- `reviews` — collection and moderation
- `page_views` — basic first-party analytics
- `meta-conversions-api.ts` — Meta CAPI already wired
- `admin-auth.ts`, `/admin` — auth and dashboard

That is leads, pipeline, marketing automation and prospecting. Roughly half
a CRM, and the half that usually takes longest.

## Phase 1 — internal tools (build this first)

Target: a screen Walid opens every morning. Two weeks of work, £0 of new
spend.

Build it **inside the existing site under `/admin`**, not as a separate
application. It reuses the auth, the database and the deployment, and adds no
new Node processes — see Constraints.

- A Today screen: new leads overnight, follow-ups due, prospects to ring
- `tel:` click-to-call. Free, works from a phone, no recording, no Twilio
- One-click call outcome logging and next action
- Email open and reply visibility on the follow-up sequence
- Lead source attribution: which page produced which enquiry

Success test: used daily for a month. If it is not, Phase 2 was never going
to be used either, and we have learned that cheaply.

## Phase 2 — client reporting

What clients actually ask for, which is much less than GHL offers:

- Cost per call and cost per enquiry, by campaign
- Spend against enquiries over time
- The enquiries themselves, with what happened to each

**The long pole is access, not code.** The Google Ads API needs an approved
developer token. Meta needs app review for `ads_read`. Both take weeks and
can be refused. Start the applications before writing any of it.

## Phase 3 — communications (first real recurring cost)

- Twilio number per client: roughly £1–2/month plus per-minute
- **Missed-call text-back.** GHL's single most popular feature and genuinely
  small: webhook on a missed call, send an SMS. A weekend, not a product.
- Call recording: UK law requires telling callers, a lawful basis and a
  retention policy. Paperwork, not a feature toggle. Do it deliberately.
- Shared inbox: each channel is its own integration. WhatsApp Business API
  needs Meta approval. This is where scope quietly triples.

## Phase 4 — product, only if 1–3 earn it

Multi-tenant, logins, billing, support, uptime, and we become a **data
processor** under UK GDPR with contracts and breach obligations. That is a
company, not a project. A PWA covers most of what a mobile app would.

An AI assistant that performs actions inside the app belongs here too, not
earlier: an agent with write access to client data needs the permissions
model to exist first.

## Constraints to design around

- **Hosting.** The account runs 5 Node apps against a 120-process ceiling and
  it took the site down on 9 Nov. A separate CRM app would be a sixth.
  Building into `/admin` avoids this entirely. More headroom is needed before
  anything new gets its own app.
- **Approvals, not code, set the timeline.** Google Ads developer token, Meta
  app review, WhatsApp Business API, Twilio compliance.
- **Legal.** Call recording and holding client customer data both carry real
  obligations. Worth getting right once rather than retrofitting.

## Open questions

- Which of our own jobs is most painful right now? That should shape Phase 1
  more than any feature list.
- Do clients want a login at all, or would a weekly emailed report do? The
  second is far cheaper and often preferred.
- GHL SaaS mode as a stopgap while Phase 1 and 2 are built, rather than an
  either/or?

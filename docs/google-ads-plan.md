# Google Ads — Executive Tints & Repairs

Working plan for the London tinting Search campaign. Built from an audit of the
previous "SMG - Tints - 15/1/26" campaign (£7,725 spent, 3 Jan – 4 Sept 2026).

## Business facts the campaign depends on

| | |
|---|---|
| Business | Executive Tints & Repairs |
| Unit | 15 Cecil Road, London E17 5DH |
| Phone | 07300 303538 |
| Email | executivetints.ontop@gmail.com |
| Landing page | https://executiveontop.com/london |
| Main site | https://executiveontop.com |
| Hours | **Monday–Sunday 9:00–18:00** (open seven days) |
| Mobile fitting | **No** — customers come to the unit |
| Same-day fitting | **Yes** |
| Reviews | None published yet — do not advertise a rating |

Prices: standard dyed tint £99 · ceramic £180 (lifetime warranty, 10% off) ·
chameleon £150 (any car, performance cars quoted individually) · dechroming £150 ·
brakes £150 · minor service £150 · major service £249 · polishing £200/£400/£600 ·
ceramic detailing POA · £400 bundle (ceramic detailing + stage 2 polish) ·
number plates (standard/3D/4D/5D, gel and non-gel).

## Budget

**£800/month maximum on tinting.** Google's monthly cap is daily budget × 30.4,
so the daily budget must be **£26/day** (26 × 30.4 = £790). Google may spend up
to 2× on a busy day but cannot exceed the monthly total.

Also set an account-level spend limit in Billing → Settings as a hard ceiling.

Meta Ads runs on a **separate £200/month**, not out of this £800. Total paid
spend across both platforms is £1,000/month.

## Conversion tracking

| | |
|---|---|
| Conversion ID | AW-17885565913 |
| Form submissions | Detected by Google from the `/thank-you` page load — **no label in code** |
| Click-to-call label | `UaiYCPzwj-4cENmnwNBC` — fired by `TrackedCallLink.tsx` |

The account has ~8 junk conversion actions (Page view, Engagement, Local actions,
Clicks to call) set to Primary and counting "Every". They cannot be deleted.
**Override them at campaign level**: set campaign-specific conversion goals to
only *Submit lead form* and *Phone call leads*.

## What the old campaign proved

Total: £7,725.15 · 40,582 impressions · 3,715 clicks · 9.15% CTR · £2.08 avg CPC.
The 235 "conversions" are inflated by the junk actions above — treat as fiction.

### Cost per conversion by match type

| Match type | Terms | Clicks | Cost | Cost/conv |
|---|---|---|---|---|
| Exact match | 18 | 308 | £707 | **£23.51** |
| Exact (close variant) | 496 | 982 | £1,960 | £23.80 |
| Phrase match | 418 | 104 | £139 | £34.68 |
| Phrase (close variant) | 1,415 | 372 | £799 | £43.99 |
| **AI Max** | **2,503** | **518** | **£1,151** | **£50.79** |

**AI Max cost more than twice as much per result. It must be switched off.**

### Waste

Running the negative list below against all 4,852 search terms blocks
**£1,325.66 — 27.9% of itemised spend** (593 clicks). Cost per conversion on
what remains drops from £30.25 to £25.68.

Wraps/PPF £495 · windscreens & auto glass £219 · general garage £113 ·
detailing/valeting £89 · "cheap"/"free" £55 (zero conversions) ·
DIY/research £38 (zero conversions) · out-of-area towns £443.

### Device split — 97% mobile

| Device | Clicks | Cost | Conv. rate |
|---|---|---|---|
| Mobile | 3,547 | £7,485 (96.9%) | **6.54%** |
| Computers | 152 | £226 | 1.97% |
| Tablets | 16 | £14 | 0.00% |

Bid adjustments: **Computers −70%, Tablets −100%.**

### Best-performing search terms

| Term | Conv. | Cost | Cost/conv |
|---|---|---|---|
| tinted windows | 3.0 | £31 | £10.22 |
| tints near me | 11.0 | £129 | £11.68 |
| tints | 5.0 | £59 | £11.76 |
| car tints | 4.0 | £53 | £13.25 |
| tinted windows near me | 4.0 | £56 | £14.06 |
| car tint near me | 7.2 | £113 | £15.75 |
| car tinting near me | 10.8 | £178 | £16.39 |
| tint shop near me | 4.3 | £96 | £22.48 |
| window tinting near me | 14.8 | £429 | £28.95 |
| car window tinting near me | 8.0 | £286 | £35.76 |

Short terms convert cheapest. "car window tinting near me" costs 3× "tints near me".

Ceramic (246 impressions, £32) and chameleon (400 impressions, £50) both returned
**zero** conversions — small samples on a generic landing page, so worth a small
test each, not a large bet.

"window tinting london" got only 32 impressions because the old campaign targeted
Essex. Expected to be a major volume driver once targeting is London.

## Campaign settings

| Setting | Value |
|---|---|
| Objective | Leads |
| Type | Search |
| Name | London Tints – Search |
| Networks | Search only — **Display OFF, Search Partners OFF** |
| Location | Nine named areas (see below), **Presence only** — not "presence or interest" |
| Language | English |
| Bidding | Maximise Clicks, max CPC £2.50 for week 1; switch to Maximise Conversions after ~15 real conversions |
| Budget | £26/day |
| Ad schedule | **Every day 08:00–19:00** — opening hours plus an hour either side |
| Devices | Computers −70%, Tablets −100% |
| Conversion goals | Campaign-specific: Submit lead form + Phone call leads only |
| AI Max | **OFF** |

## Locations

Named areas rather than a radius, so central London (expensive clicks, low car
ownership, congestion charge) is excluded by omission rather than by exclusion
rules. Total reach ~3.95 million.

| Area | Type | Reach |
|---|---|---|
| London Borough of Waltham Forest | district | 953,000 |
| London Borough of Newham | district | 902,000 |
| London Borough of Enfield | borough | 642,000 |
| London Borough of Redbridge | borough | 593,000 |
| London Borough of Haringey | district | 498,000 |
| IG11 (Barking) | postcode | 216,000 |
| Loughton | city | 65,000 |
| Chigwell | city | 54,000 |
| IG9 (Buckhurst Hill) | postcode | 28,000 |

"Epping Forest" is not in Google's location list — use the individual towns
(Chigwell, Loughton) and postcodes (IG9) instead.

Hackney was deliberately left out: ~965,000 reach but among the lowest car
ownership in London and the most expensive clicks of the candidates. The E17
postcode was removed as redundant, since Waltham Forest already contains it.

Deliberate tension with the negative keywords: the targeting includes Ilford and
Barking while `-ilford` and `-barking` stay blocked. Someone there searching
"car tinting near me" sees the ad; someone searching "window tinting ilford"
does not, because shops actually in Ilford will always beat us on that term.
Target the geography, don't buy the town name.

If impressions are healthy but calls are few after two weeks, narrow the area
rather than raising the budget.

## Keywords

### Ad group 1 — Tints
```
[tints near me]
[car tinting near me]
[car tint near me]
[tinted windows near me]
[tint shop near me]
[window tinting near me]
[car window tinting near me]
[window tints near me]
[car tints near me]
[tint windows near me]
[car tints]
[tinted windows]
[tints]
[window tinting london]
[car window tinting london]
[window tint london]
"window tinting"
"car window tinting"
```

### Ad group 2 — Ceramic
```
[ceramic tint]
[ceramic window tint]
"ceramic tint"
```

### Ad group 3 — Chameleon
```
[chameleon tint]
[chameleon window tint]
"chameleon tint"
```

### Negative keywords (campaign level)
```
-free
-cheap
-cheapest
-budget
-discount
-diy
-how to
-how much
-yourself
-cost calculator
-price list
-quotes
-removal
-remove
-illegal
-legal
-law
-mot
-jobs
-job
-vacancy
-course
-training
-apprentice
-wholesale
-supplier
-film roll
-kit
-second hand
-windscreen
-windshield
-auto glass
-autoglass
-chip repair
-resin repair
-glass replacement
-headlight
-rear light
-sunroof
-wrap
-wraps
-wrapping
-vinyl
-ppf
-paint protection
-chrome delete
-dechrome
-detailing
-detail
-valet
-valeting
-paint shop
-body shop
-bodyshop
-smart repair
-garage
-garages
-mechanic
-modification
-modify
-styling
-respray
-exhaust
-alloy
-remap
-tyre
-dyno
-romford
-basildon
-grays
-essex
-welling
-barking
-ilford
-bromley
-dagenham
-chatham
-tunbridge
-dartford
-thurrock
-kent
-rainham
-hornchurch
-upminster
-brentwood
-chelmsford
-southend
-gravesend
-medway
-maidstone
-canvey
-doctor tint
-polimax
-tint club
-tint studio
-autodetailz
-got tinted
-mass tints
-autosential
-global tint
-select tints
-elite styling
-mq styling
```

Note: `-wrap`, `-chrome delete` and `-detailing` block dechroming and ceramic
detailing searches. Deliberate — this campaign sells tints only. Those services
get their own campaign once tints are profitable.

## Ad copy

Final URL `https://executiveontop.com/london` · display path `/london/call-now` ·
phone 07300 303538 · no pinning (let Google test combinations for the first month).

### Headlines (15)
```
Car Window Tinting {LOCATION(City):London}
{KeyWord:Car Window Tinting}
Car Window Tinting From £99
Ceramic Tint From £180
Lifetime Warranty Ceramic
Window Tinting Walthamstow
Heat & UV Protection Tints
Bubble-Free Tint Fitting
Chameleon Tints From £150
Premium Car Tinting E17
10% Off Ceramic Tint
Ceramic Window Tint Experts
Same Day Tinting Available
Call For A Free Quote
Book Your Tint Today
```

### Descriptions (4)
```
Car window tinting in London from £99. Heat and UV protection, fitted by hand.
Ceramic tint from £180 with a lifetime warranty. Book at our Walthamstow unit.
Standard, ceramic and chameleon tints fitted in E17. Clear prices, no surprises.
Same-day tinting available. Call Executive Tints & Repairs for a free quote.
```

Do **not** claim mobile fitting or residential/commercial tinting — neither is offered.

### Sitelinks

| Text | Line 1 | Line 2 | URL |
|---|---|---|---|
| Ceramic Tint | Lifetime warranty included | Premium film from £180 | `/tints` |
| Standard Tint From £99 | Glare & UV protection | Legal shades, hand fitted | `/pricing` |
| Chameleon Tint | Colour-shifting blue or red | One price, £150 any car | `/tints` |
| Price List | All tints & services priced | No hidden costs | `/pricing` |
| Get A Free Quote | Tell us your car and shade | We reply the same day | `/quote` |
| Opening Hours & Address | 15 Cecil Road, London E17 | Open 7 days, 9am-6pm | `/contact` |

### Callouts
```
Lifetime Warranty
Same Day Fitting
Fixed Prices
Hand Fitted
Free Quotes
Walthamstow E17
```

### Other assets
- **Call asset** — 07300 303538, scheduled to opening hours
- **Location asset** — needs the Google Business Profile linked
- **Structured snippet** — Services: Standard Tint, Ceramic Tint, Chameleon Tint, Dechroming, Number Plates
- **Images** — 6–10 real photos from the unit, landscape, no text overlay. This is
  the main gap versus the old campaign, which ran 20 images.

Leave the **tracking template empty**. The old one
(`{lpurl}&kwd=...&gclid={gclid}`) was malformed — it starts with `&` on a URL
with no query string, and `gclid` is added automatically by auto-tagging.

## Phases

1. **Tracking** — done in code (commit 982456a). Verify the `/thank-you` URL rule
   contains the hyphen, then redeploy on Hostinger and test the tag fires.
2. **Google Ads** — this document.
3. **Meta Ads** — not started.
4. **SEO / organic** — a slower, separate channel to paid. Ordered by what
   actually moves the needle for a local trade:

   1. **Google Search Console** — verify `executiveontop.com` and submit
      `sitemap.xml`. Without it a brand-new domain with no inbound links can sit
      undiscovered for weeks. Paste the token into `googleSiteVerification` in
      `src/lib/site-config.ts` and redeploy.
   2. **Google Business Profile** — for a business people search "near me" for,
      the map listing drives more calls than the website. Complete every field,
      add photos, post weekly.
   3. **Reviews** — the single biggest factor in map-pack ranking. Currently
      12, averaging 5.0, and all published on the site (home page and /london)
      with Review + AggregateRating schema. Keep asking every customer, and
      keep `siteConfig.reviews.count` in step with the real profile.
   4. **Local citations** — consistent name/address/phone on Yell, Thomson
      Local, FreeIndex, Bing Places, Apple Business Connect.
   5. **Location pages** — `/window-tinting-walthamstow` and similar, targeting
      the "near me" terms the ad data proved valuable.
   6. **Time.** New domains take roughly 3-6 months to rank for competitive
      terms. SEO will not deliver customers this month; the ads will.

   Already in place: 6 blog posts (`src/content/blog.ts`), AutoRepair / FAQPage /
   BlogPosting JSON-LD, sitemap and robots generated from `siteConfig.url`,
   per-page canonicals, `en-GB` locale, `/thank-you` disallowed in robots.txt.


## Handover — putting everything in the client's name

The work is being run for a client who owns the business. Everything below
moves the assets onto the client's identity and the client's money. Two
reasons it matters: the client should legally own what they paid for, and an
account billed to the agency's card is an account Google can associate with
the agency's other accounts.

### The structure to aim for

The client owns every asset under **their own Google login, verified in their
name, billed to their card**. The agency gets in through a **Google Ads
manager account (MCC)**, which grants day-to-day control without owning the
account or its billing. This is how agencies are supposed to be set up, and
it is the arrangement that actually separates the two parties — not editing
a name field.

### What can never be changed on a Google Ads account

Decide these before creating anything; they are set at creation and permanent:

- **Currency** and **time zone** on the Ads account.
- **Billing country.**
- **Payments profile type** — individual vs business. A profile created as
  individual can never become a business profile.

If any of these are wrong for the client, no amount of editing fixes it — the
account has to be recreated, which costs the conversion history and the
bidding algorithm's learning.

### Google Ads

| What | Where | Editable? |
|---|---|---|
| Account name | Admin → Account settings | Yes, freely |
| Business name | Admin → Account settings | Yes |
| Payments profile name + address | Billing → Settings | Usually, may trigger re-verification |
| Payment method | Billing → Payment methods | Yes — put the client's card on |
| Advertiser verification | Admin → Account settings → Advertiser verification | Must be redone in the client's name |
| Users | Admin → Access and security | Yes |
| Currency / time zone | — | **Never** |

**Advertiser verification is the one that actually makes it "the client's".**
Google publicly displays the verified advertiser next to the ads. If the
client's business should be the advertiser, the client's entity has to pass
verification with their own documents. Changing the account name without
redoing verification leaves the agency named on the public disclosure.

### Order of operations

Do not change name, address and payment method on the same day. Several
simultaneous identity and billing edits on a live account is a known trigger
for a billing review — which pauses the ads. Stagger it:

1. Client creates (or confirms) their own Google account.
2. Invite that account as **Admin** under Access and security. Client accepts.
3. Confirm the client can actually sign in and see the account.
4. Add the **client's card** as the payment method and make it primary.
   Leave the old card in place for a few days as a backstop.
5. A few days later, update the **payments profile name and address**.
6. Redo **advertiser verification** in the client's name.
7. Link the account to the agency **manager account**, if using one.
8. Only once all of the above is confirmed working, remove the agency's
   direct Admin user. Google requires at least one admin at all times.
9. Remove the old card.

### The other properties

- **Google Business Profile** — Settings → People and access → Add → Owner.
  Then transfer primary ownership. Google enforces a waiting period before a
  newly added owner can be made primary, so add them well ahead of time.
- **Search Console** — a verified owner has to be added as an owner, not a
  user. Either the client verifies the domain independently (DNS record) or
  an existing verified owner delegates ownership under Settings → Users and
  permissions → Manage property owners.
- **Google Analytics**, if in use — Admin → Account access management →
  add the client as Administrator.
- **The domain** (`executiveontop.com`) and the Hostinger hosting — either
  transfer the domain to the client's registrar account with an auth code, or
  hand over the Hostinger account itself. A client who does not control their
  own domain does not really own their website.
- **The Gmail address** (`executivetints.ontop@gmail.com`) — the client should
  hold the password and be the recovery contact. Longer term this should be
  Google Workspace on the domain rather than a Gmail address.
- **Meta** — the client's Business Manager should own the Page, the ad
  account and the pixel; the agency gets partner access.

### What this does not do

Changing these details does not unlink the account from a suspended one.
Google associates accounts by payment instrument, login, recovery details,
phone, device and domain as well as by name. Make these changes because the
current details are wrong, not as a shield. Accurate client details are
easier to defend in a review than mismatched ones — but they are not a
firewall.

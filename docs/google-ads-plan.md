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
| Hours | Mon–Fri 9:00–18:00, Sat 9:00–16:00, Sun closed |
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
| Location | 8–12 mile radius around E17 5DH, **Presence only** |
| Language | English |
| Bidding | Maximise Clicks, max CPC £2.50 for week 1; switch to Maximise Conversions after ~15 real conversions |
| Budget | £26/day |
| Ad schedule | Mon–Fri 08:00–19:00, Sat 08:00–17:00 (opening hours plus one hour either side) |
| Devices | Computers −70%, Tablets −100% |
| Conversion goals | Campaign-specific: Submit lead form + Phone call leads only |
| AI Max | **OFF** |

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
| Opening Hours & Address | 15 Cecil Road, London E17 | Mon-Fri 9-6, Sat 9-4 | `/contact` |

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
4. **SEO** — after launch, so customers come from organic search as well as paid.
   The site already has: blog posts in `src/content/blog.ts`, JSON-LD structured
   data, sitemap and robots generated from `siteConfig.url`, per-page canonicals.
   Next steps will be Google Business Profile optimisation, local citations, and
   location/service landing pages targeting the terms the ad data proved
   valuable ("car tinting near me", "window tinting london").

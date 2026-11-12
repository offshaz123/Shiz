"use client";

/**
 * The six service demos — a small animated picture of each service doing its
 * job.
 *
 * Lifted out of ServicesShowcase so the service pages can show the same
 * thing. One copy, so a change to how Meta ads are illustrated happens in one
 * place and both pages move together.
 *
 * Everything is CSS keyframes with staggered delays (see globals.css). The
 * panel is remounted on a key to replay, so nothing runs when it is not on
 * screen.
 *
 * Nothing in here shows a figure. These are illustrations of how the work
 * runs, and a number in an illustration reads as a result whatever label sits
 * underneath it.
 */

export function ServiceDemo({ slug }: { slug: string }) {
  switch (slug) {
    case "meta-instagram-ads":
      return <AdsDemo />;
    case "google-ads":
      return <SearchDemo />;
    case "crm-automation":
      return <CrmDemo />;
    case "seo":
      return <SeoDemo />;
    case "web-design":
      return <SiteDemo />;
    case "social-media-management":
      return <SocialDemo />;
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------
   Shared bits
---------------------------------------------------------------------------*/

export function Tick() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-brand-pink">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The card every demo sits in, with a status strip across the top. */
function Frame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="svc-rise rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2 text-[11px] font-medium text-white/50">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-pink/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-pink" />
        </span>
        {label}
      </div>
      {children}
    </div>
  );
}

/** A grey placeholder line, for the parts of a mock-up that are just shape. */
function Bar({ w = "100%", delay = 0 }: { w?: string; delay?: number }) {
  return (
    <span
      className="svc-grow block h-2 rounded-full bg-white/15"
      style={{ width: w, animationDelay: `${delay}s` }}
    />
  );
}

/* -------------------------------------------------------------------------
   Meta & Instagram Ads — two versions running, the weaker one switched off
---------------------------------------------------------------------------*/

function AdsDemo() {
  return (
    <Frame label="Two versions running against each other">
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: "Version A", delay: 0.1, bar: "38%", winner: false },
          { name: "Version B", delay: 0.25, bar: "100%", winner: true },
        ].map((v) => (
          <div
            key={v.name}
            className={`svc-pop rounded-xl border p-3 ${
              v.winner ? "border-brand-pink/60 bg-brand-pink/10" : "border-white/10 bg-white/[0.03]"
            }`}
            style={{ animationDelay: `${v.delay}s` }}
          >
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 rounded-full bg-white/20" />
              <span className="text-[10px] uppercase tracking-wide text-white/40">Sponsored</span>
            </div>
            <div
              className="svc-grow mt-2.5 h-14 rounded-lg bg-white/10"
              style={{ animationDelay: `${v.delay + 0.15}s` }}
            />
            <div className="mt-2.5 space-y-1.5">
              <Bar w="85%" delay={v.delay + 0.3} />
              <Bar w="60%" delay={v.delay + 0.36} />
            </div>
            {/* Runs on a loop. This panel used to finish in two seconds and
                then sit still for the rest of its turn, which made the one
                service whose whole point is continuous testing look the most
                static of the six. */}
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <span
                className="svc-race block h-full rounded-full bg-brand-pink"
                style={{ width: v.bar, animationDelay: `${v.delay}s` }}
              />
            </div>
            <p
              className="svc-verdict mt-2 text-[10px] font-semibold"
              style={{ animationDelay: `${v.delay}s` }}
            >
              <span className={v.winner ? "text-brand-pink" : "text-white/35"}>
                {v.winner ? "Enquiries coming in" : "Switched off"}
              </span>
            </p>
          </div>
        ))}
      </div>
      <p className="svc-rise mt-4 text-xs text-white/45" style={{ animationDelay: "1.2s" }}>
        Whichever one your customers respond to gets the budget. The other stops. That is the whole
        job, repeated every week.
      </p>
    </Frame>
  );
}

/* -------------------------------------------------------------------------
   Google Ads — somebody searches, you are the first thing they see
---------------------------------------------------------------------------*/

function SearchDemo() {
  return (
    <Frame label="Someone searching right now">
      <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2.5">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0 text-white/40">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span className="svc-type text-sm text-white/85">emergency car recovery near me</span>
        <span className="svc-caret h-4 w-px bg-brand-pink" />
      </div>

      <div className="mt-4 space-y-2.5">
        <div
          className="svc-pop rounded-xl border border-brand-pink/50 bg-brand-pink/10 p-3"
          style={{ animationDelay: "1.5s" }}
        >
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-pink px-1.5 py-0.5 text-[9px] font-bold text-white">
              AD
            </span>
            <span className="text-xs font-semibold text-white">Your business</span>
          </div>
          <div className="mt-2 space-y-1.5">
            <Bar w="92%" delay={1.7} />
            <Bar w="70%" delay={1.76} />
          </div>
          <div className="mt-3 flex gap-2">
            <span
              className="svc-pop rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-[#121218]"
              style={{ animationDelay: "2.1s" }}
            >
              Call now
            </span>
            <span
              className="svc-pop rounded-full border border-white/25 px-3 py-1 text-[10px] font-semibold text-white/80"
              style={{ animationDelay: "2.2s" }}
            >
              Get a quote
            </span>
          </div>
        </div>

        {[2.5, 2.65].map((d, i) => (
          <div key={i} className="rounded-xl border border-white/10 p-3 opacity-50">
            <div className="space-y-1.5">
              <Bar w="55%" delay={d} />
              <Bar w="80%" delay={d + 0.06} />
            </div>
          </div>
        ))}
      </div>

      <p className="svc-rise mt-4 text-xs text-white/45" style={{ animationDelay: "3s" }}>
        Everyone below you is a competitor who waited to be found.
      </p>
    </Frame>
  );
}

/* -------------------------------------------------------------------------
   CRM & automation — the bit that happens while you are under a car
---------------------------------------------------------------------------*/

const CRM_STEPS = [
  "Instagram message arrives at 9pm",
  "Lands in one inbox with the emails and texts",
  "Auto-reply goes out inside a minute",
  "Card moves itself to “Quoted”",
  "Follow-up sends on day two, then day four",
];

function CrmDemo() {
  return (
    <Frame label="Running on its own · nobody had to be free">
      <ul>
        {CRM_STEPS.map((step, i) => (
          <li
            key={step}
            className="svc-rise flex items-center gap-3 border-b border-white/[0.07] py-3 last:border-0"
            style={{ animationDelay: `${0.2 + i * 0.5}s` }}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-pink">
              <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 text-white">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="text-sm text-white/80">{step}</span>
          </li>
        ))}
      </ul>
      <p className="svc-rise mt-4 text-xs text-white/45" style={{ animationDelay: "2.9s" }}>
        The enquiry you would have found on Thursday is answered on Monday night.
      </p>
    </Frame>
  );
}

/* -------------------------------------------------------------------------
   SEO — climbing the page
---------------------------------------------------------------------------*/

const ROW_H = 44; // px, must match the row height below

function SeoDemo() {
  return (
    <Frame label="Where you sit on the page">
      <div className="space-y-2">
        <div
          className="svc-climb flex h-[36px] items-center gap-3 rounded-xl border border-brand-pink/50 bg-brand-pink/10 px-3"
          style={{ ["--svc-climb" as string]: `${ROW_H * 4}px` }}
        >
          <span className="text-xs font-bold text-brand-pink">1</span>
          <span className="text-xs font-semibold text-white">Your business</span>
          <span className="ml-auto text-[10px] text-white/50">↑ from 5th</span>
        </div>
        {[2, 3, 4, 5].map((n, i) => (
          <div
            key={n}
            className="svc-rise flex h-[36px] items-center gap-3 rounded-xl border border-white/10 px-3 opacity-55"
            style={{ animationDelay: `${0.3 + i * 0.12}s` }}
          >
            <span className="text-xs font-bold text-white/40">{n}</span>
            <Bar w={`${55 - i * 7}%`} delay={0.4 + i * 0.12} />
          </div>
        ))}
      </div>

      <div
        className="svc-pop mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
        style={{ animationDelay: "2.4s" }}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sm">
          ★
        </span>
        <div>
          <p className="text-xs font-semibold text-white">Google Business Profile</p>
          <p className="text-[11px] text-white/45">Filled in properly, posting, collecting reviews</p>
        </div>
      </div>
    </Frame>
  );
}

/* -------------------------------------------------------------------------
   Websites — a page assembling itself
---------------------------------------------------------------------------*/

function SiteDemo() {
  return (
    <Frame label="Building the page">
      <div className="flex gap-3">
        <div className="flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
          <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="h-2 w-2 rounded-full bg-white/20" />
            <span className="ml-2 flex-1">
              <Bar w="60%" delay={0.1} />
            </span>
          </div>
          <div className="space-y-2.5 p-3">
            <div className="flex items-center gap-2">
              <span
                className="svc-grow h-3 w-3 rounded bg-brand-pink"
                style={{ animationDelay: "0.3s" }}
              />
              <Bar w="30%" delay={0.35} />
              <span className="ml-auto">
                <Bar w="40px" delay={0.4} />
              </span>
            </div>
            <div
              className="svc-grow h-12 rounded-lg bg-white/10"
              style={{ animationDelay: "0.6s" }}
            />
            <Bar w="85%" delay={0.8} />
            <Bar w="65%" delay={0.86} />
            <div
              className="svc-pop rounded-lg border border-brand-pink/40 bg-brand-pink/10 p-2.5"
              style={{ animationDelay: "1.2s" }}
            >
              <p className="text-[10px] font-semibold text-white">Get a free quote</p>
              <div className="mt-1.5 space-y-1">
                <Bar w="100%" delay={1.4} />
                <Bar w="100%" delay={1.46} />
              </div>
              <span
                className="svc-pop mt-2 block h-4 w-16 rounded-full bg-brand-pink"
                style={{ animationDelay: "1.7s" }}
              />
            </div>
          </div>
        </div>

        <div
          className="svc-pop w-16 shrink-0 self-start overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] p-1.5"
          style={{ animationDelay: "2s" }}
        >
          <span className="mx-auto mb-1.5 block h-1 w-6 rounded-full bg-white/20" />
          <div className="space-y-1.5">
            <div
              className="svc-grow h-8 rounded bg-white/10"
              style={{ animationDelay: "2.2s" }}
            />
            <Bar w="90%" delay={2.3} />
            <Bar w="70%" delay={2.36} />
            <span
              className="svc-pop block h-3 w-full rounded bg-brand-pink"
              style={{ animationDelay: "2.5s" }}
            />
          </div>
        </div>
      </div>

      <p className="svc-rise mt-4 text-xs text-white/45" style={{ animationDelay: "2.9s" }}>
        Built for the phone first, because that is where your ads land. Tracking in from day one,
        and the whole thing stays in your name.
      </p>
    </Frame>
  );
}

/* -------------------------------------------------------------------------
   Social media — a week that looks like a working business
---------------------------------------------------------------------------*/

const WEEK = [
  { day: "M", kind: "post" },
  { day: "T", kind: "none" },
  { day: "W", kind: "reel" },
  { day: "T", kind: "post" },
  { day: "F", kind: "none" },
  { day: "S", kind: "post" },
  { day: "S", kind: "reel" },
] as const;

function SocialDemo() {
  return (
    <Frame label="This week, planned and scheduled">
      <div className="grid grid-cols-7 gap-1.5">
        {WEEK.map((d, i) => (
          <div key={i} className="text-center">
            <p className="mb-1.5 text-[10px] text-white/35">{d.day}</p>
            <div
              className={`svc-pop flex h-16 items-center justify-center rounded-lg border ${
                d.kind === "none"
                  ? "border-white/[0.07] bg-white/[0.02]"
                  : d.kind === "reel"
                    ? "border-brand-pink/50 bg-brand-pink/15"
                    : "border-white/15 bg-white/10"
              }`}
              style={{ animationDelay: `${0.2 + i * 0.13}s` }}
            >
              {d.kind === "reel" && (
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-pink" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
              {d.kind === "post" && <span className="h-5 w-5 rounded bg-white/25" />}
            </div>
          </div>
        ))}
      </div>

      <div
        className="svc-rise mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3"
        style={{ animationDelay: "1.5s" }}
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0 text-brand-pink">
          <path
            d="M21 11.5a8.4 8.4 0 01-9 8.4 8.6 8.6 0 01-3.8-.9L3 20l1.3-4a8.4 8.4 0 01-.9-3.8 8.4 8.4 0 018.4-9 8.4 8.4 0 019.2 8.3z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-xs text-white/70">
          Comments and DMs answered in the same inbox as everything else, so nothing sits unread.
        </p>
      </div>

      <p className="svc-rise mt-4 text-xs text-white/45" style={{ animationDelay: "1.9s" }}>
        Built around what your customers actually ask, not a calendar of national days.
      </p>
    </Frame>
  );
}

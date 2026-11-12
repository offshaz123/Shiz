"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { services } from "@/content/services";
import { ServiceDemo, Tick } from "./ServiceDemos";

/**
 * "See each service working."
 *
 * The services grid told people what we sell in a paragraph each. This shows
 * them instead: a tab per service, and a small animated picture of that
 * service doing its job. It plays by itself so a visitor who scrolls past
 * without touching anything still sees three or four of them, and stops
 * playing the moment somebody picks a tab, because at that point they are
 * reading rather than watching.
 *
 * Every animation is CSS keyframes with staggered delays (see globals.css).
 * The panel is remounted on a key when the tab changes, which replays the
 * whole sequence from the start with no animation library and nothing running
 * between tabs.
 *
 * Nothing in here shows a figure. These are illustrations of how the work
 * runs, and a number in an illustration reads as a result whatever label sits
 * underneath it.
 */

/**
 * Google Ads leads, because its demo is the best of the six — a search being
 * typed is the one that reads instantly. The grid on /services keeps the
 * content file's own order; this is a display order for the showcase only.
 */
const ORDER = [
  "google-ads",
  "meta-instagram-ads",
  "crm-automation",
  "seo",
  "web-design",
  "social-media-management",
];

const TABS = ORDER.map((slug) => services.find((s) => s.slug === slug)).filter(
  (s): s is (typeof services)[number] => Boolean(s),
);

/**
 * How long each one stays up: its own animation, plus a couple of seconds to
 * read the result. A single fixed dwell left the short demos sitting finished
 * and cut the long ones off mid-way.
 */
const DWELL: Record<string, number> = {
  "google-ads": 6200,
  "meta-instagram-ads": 6800,
  "crm-automation": 6400,
  seo: 5600,
  "web-design": 6400,
  "social-media-management": 5000,
};

const DEFAULT_DWELL = 6000;

/** One short label per service, shown above the name like a category. */
const CATEGORY: Record<string, string> = {
  "meta-instagram-ads": "Paid social",
  "google-ads": "Search",
  "crm-automation": "Follow-up",
  seo: "Being found",
  "web-design": "The site itself",
  "social-media-management": "Presence",
};

/** The short name on the tab, since the full service names are long. */
const TAB_LABEL: Record<string, string> = {
  "meta-instagram-ads": "Meta & Instagram",
  "google-ads": "Google Ads",
  "crm-automation": "CRM & follow-up",
  seo: "SEO & local",
  "web-design": "Websites",
  "social-media-management": "Social media",
};

export function ServicesShowcase() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [picked, setPicked] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Only play while the section is actually on screen, and never for someone
  // who has asked their device for less movement.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.25 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // A timeout rather than an interval, because each service waits a
  // different length of time — re-armed every time the tab changes.
  useEffect(() => {
    if (!playing || picked) return;
    const wait = DWELL[TABS[active].slug] ?? DEFAULT_DWELL;
    const timer = setTimeout(() => setActive((i) => (i + 1) % TABS.length), wait);
    return () => clearTimeout(timer);
  }, [playing, picked, active]);

  const service = TABS[active];
  const running = playing && !picked;

  return (
    <section ref={sectionRef} className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="max-w-2xl">
        <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
          What we do
        </span>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          See each service <span className="brand-gradient-text">actually working</span>
        </h2>
        <p className="mt-5 text-muted">
          Tap a service to see what it does, what&apos;s included and what it starts from. Or leave
          it running.
        </p>
      </div>

      <div className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#121218] shadow-xl shadow-black/5">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Services"
          className="no-scrollbar flex gap-2 overflow-x-auto border-b border-white/10 p-3 sm:flex-wrap sm:p-4"
        >
          {TABS.map((s, i) => {
            const isActive = i === active;
            return (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => {
                  setActive(i);
                  setPicked(true);
                }}
                className={`relative shrink-0 overflow-hidden whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-colors sm:text-sm ${
                  isActive
                    ? "bg-brand-pink text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                {TAB_LABEL[s.slug] ?? s.name}
                {/* Fills over the dwell, so the tab says before it moves that
                    it is about to. */}
                {isActive && running && (
                  <span
                    key={`dwell-${active}`}
                    className="svc-dwell absolute inset-x-0 bottom-0 h-[2px] bg-white/70"
                    style={{ animationDuration: `${DWELL[s.slug] ?? DEFAULT_DWELL}ms` }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Panel. The key remounts it so every animation replays. */}
        <div
          key={service.slug}
          className="svc-slide grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center"
        >
          <div>
            <p className="svc-rise text-xs font-semibold uppercase tracking-[0.18em] text-brand-pink">
              {CATEGORY[service.slug] ?? "Service"}
            </p>
            <h3
              className="svc-rise mt-3 text-2xl font-bold text-white sm:text-3xl"
              style={{ animationDelay: "0.06s" }}
            >
              {service.name}
            </h3>
            <p
              className="svc-rise mt-3 max-w-md text-sm leading-relaxed text-white/60"
              style={{ animationDelay: "0.12s" }}
            >
              {service.teaser}
            </p>

            <ul className="mt-6 space-y-2.5">
              {service.includes.slice(0, 3).map((item, i) => (
                <li
                  key={item.title}
                  className="svc-rise flex items-start gap-2.5 text-sm text-white/80"
                  style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                >
                  <Tick />
                  {item.title}
                </li>
              ))}
            </ul>

            <div
              className="svc-rise mt-7 flex flex-wrap items-center gap-3"
              style={{ animationDelay: "0.48s" }}
            >
              {service.pricing && (
                <span className="rounded-full border border-brand-pink/50 px-4 py-2 text-sm font-semibold text-brand-pink">
                  {service.pricing.headline}
                </span>
              )}
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#121218] transition-transform hover:scale-[1.03]"
              >
                See {TAB_LABEL[service.slug]?.toLowerCase() ?? "more"}{" "}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <ServiceDemo slug={service.slug} />
        </div>
      </div>
    </section>
  );
}

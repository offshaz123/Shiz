"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PhotoBackdrop } from "@/components/PhotoBackdrop";
import { currencies } from "@/lib/brand";

/**
 * "What you can do" — one panel per line of business, turning on its own.
 *
 * It advances every six seconds, stops while the pointer or keyboard focus is
 * inside it so nobody loses a link mid-read, and does not advance at all for
 * anyone who has asked for reduced motion. The dots are real buttons: tapping
 * one takes over and the dwell restarts from there.
 *
 * The panel sits on a photograph with our blue washed over it, and the
 * ledger grid stays on top for texture.
 *
 * This reverses an earlier decision. The panels used to be drawn rather than
 * photographed, on the grounds that every payments site in this category
 * already runs stock photography — and that still holds as a general point.
 * What changed is that the picture is the owner's own and it is treated
 * rather than dropped in: the wash keeps it in the brand, so it reads as our
 * panel rather than as a stock image someone bought.
 *
 * The photograph is deliberately ONE image behind all four slides, not one
 * per slide. The other images are already on this page, and the panel
 * changing its own backdrop every six seconds on top of everything else
 * moving would be one animation too many.
 */
const slides = [
  {
    badge: "Accounts",
    title: "One IBAN. Twelve currencies.",
    body: `Eleven foreign currencies alongside sterling. Receive into them, hold the balance until the rate suits you, and convert through real-time FX.`,
    href: "/solutions/multi-currency-accounts",
    linkLabel: "Explore multi-currency accounts",
    statValue: String(currencies.length),
    statLabel: "Currencies on one account",
  },
  {
    badge: "Business payments",
    title: "Money in, converted, money out.",
    body: "Collect from your UK customers, convert at a rate you are quoted before you commit, and pay suppliers abroad — three steps most businesses run across three providers.",
    href: "/solutions/business-payments",
    linkLabel: "Explore business payments",
    statValue: "Same day",
    statLabel: "Where the corridor and cut-off allow",
  },
  {
    badge: "Payroll",
    title: "Pay a distributed team on the day.",
    body: "Payroll is the least forgiving payment there is: it has to clear on the day it is supposed to, in the currency the person is paid in. Built for that, at volume.",
    href: "/solutions/global-payroll",
    linkLabel: "Explore global payroll",
    statValue: "One file",
    statLabel: "However many people are on it",
  },
  {
    badge: "Software",
    title: "Already licensed? Take the platform.",
    body: "If you hold your own SPI or API permission you do not need our licence — you need the technology. Customer portal, iOS and Android apps, and an admin back end.",
    href: "/software",
    linkLabel: "See the platform",
    statValue: "Web · iOS · Android",
    statLabel: "Shipped already integrated",
  },
];

export function WhatYouCanDo() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = slides[index];

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
    // Re-armed on `index` so a tap gets a full dwell rather than the remainder.
  }, [paused, index]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-3xl text-on-ink">
        <PhotoBackdrop src="/images/demo-presentation.webp" strength="heavy" position="center 30%" />
        <div className="ledger-grid pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />

        <div
          key={slide.badge}
          className="animate-amount relative grid gap-8 p-7 sm:p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:gap-12 lg:p-14"
        >
          <div>
            <span className="inline-flex rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold text-[#7dd3fc] backdrop-blur">
              {slide.badge}
            </span>
            <h3 className="font-display text-balance mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {slide.title}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80">{slide.body}</p>
            <Link
              href={slide.href}
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#7dd3fc] transition-colors hover:text-white"
            >
              {slide.linkLabel}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-white/15 bg-white/[0.10] p-7 text-center backdrop-blur-md">
            <p className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
              {slide.statValue}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{slide.statLabel}</p>
          </div>
        </div>
      </div>

      <div className="mt-7 flex items-center justify-center gap-2.5">
        {slides.map((item, position) => {
          const active = position === index;
          return (
            <button
              key={item.badge}
              type="button"
              onClick={() => setIndex(position)}
              aria-label={`Show ${item.badge}`}
              aria-current={active}
              className={`h-2.5 rounded-full transition-all ${
                active ? "w-8 bg-accent" : "w-2.5 bg-border hover:bg-accent/50"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { clientResults } from "@/content/case-studies";
import { ClientLogo } from "./ClientLogo";
import { CountUp } from "./CountUp";

/**
 * The result card in the hero, cycling through every client rather than
 * showing the first one forever.
 *
 * There are four real, approved results in the content file and the hero was
 * only ever showing CoBanq. Four pieces of proof beat one, and a card that
 * changes gives somebody a reason to keep looking at it.
 *
 * Stops cycling the moment a dot is pressed, on the same reasoning as the
 * services showcase: at that point they are reading, not watching.
 */

const DWELL_MS = 5200;

export function HeroResultCard() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [picked, setPicked] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || picked || clientResults.length < 2) return;
    const timer = setInterval(
      () => setActive((i) => (i + 1) % clientResults.length),
      DWELL_MS,
    );
    return () => clearInterval(timer);
  }, [playing, picked]);

  const result = clientResults[active];

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-white/20 bg-[#0b0a0f]/85 p-6 shadow-2xl shadow-black/30 backdrop-blur"
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
          Real client result
        </span>
        <span className="ml-auto text-[11px] tabular-nums text-white/35">
          {active + 1}/{clientResults.length}
        </span>
      </div>

      {/* Keyed so each client slides in rather than the text simply swapping. */}
      <div key={result.slug} className="svc-slide">
        <div className="mt-4 flex items-center gap-3">
          <ClientLogo result={result} size={42} onDark />
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold leading-snug text-white">
              {result.client}
            </p>
            <p className="text-sm text-white/55">
              {result.sector} · {result.period}
            </p>
          </div>
        </div>

        {/* A fixed height, so a client with a longer sector line or shorter
            stat labels does not make the whole hero jump as it comes round. */}
        <div className="mt-5 grid min-h-[7.5rem] grid-cols-2 gap-x-6 gap-y-4 content-start">
          {result.stats.map((stat) => (
            <div key={stat.label}>
              <CountUp
                value={stat.value}
                className="block text-2xl font-bold tracking-tight text-white sm:text-[1.75rem]"
              />
              <p className="mt-0.5 text-xs leading-tight text-white/55">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link
          href={`/case-studies/${result.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
        >
          See how we did it <span aria-hidden="true">→</span>
        </Link>
        {result.website && (
          <a
            href={result.website}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate text-sm text-white/55 hover:text-white"
          >
            {result.website.replace(/^https?:\/\//, "")} ↗
          </a>
        )}
      </div>

      {clientResults.length > 1 && (
        <div className="mt-5 flex items-center gap-2">
          {clientResults.map((r, i) => (
            <button
              key={r.slug}
              type="button"
              aria-label={`Show ${r.client}`}
              aria-current={i === active}
              onClick={() => {
                setActive(i);
                setPicked(true);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-7 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

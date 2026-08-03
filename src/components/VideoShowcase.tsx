"use client";

import { useEffect } from "react";
import { siteConfig } from "@/lib/site-config";

// Add real TikTok video links here — each renders as a live embed (real thumbnail, caption,
// and "View on TikTok" link) via TikTok's official embed widget.
const videoUrls = [
  "https://www.tiktok.com/@shazmotorgroup/video/7622318355227168022",
  "https://www.tiktok.com/@shazmotorgroup/video/7628982753115032854",
  "https://www.tiktok.com/@shazmotorgroup/video/7621694108863679766",
  "https://www.tiktok.com/@shazmotorgroup/video/7598574230938111254",
  "https://www.tiktok.com/@shazmotorgroup/video/7631602941153004822",
];

function getVideoId(url: string) {
  return url.split("/video/")[1]?.split("?")[0] ?? "";
}

declare global {
  interface Window {
    tiktokEmbedLoad?: () => void;
  }
}

function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M15 4v9.5a3.5 3.5 0 1 1-3.5-3.5c.3 0 .6 0 .9.1M15 4c.3 2 1.8 3.4 4 3.6V10c-1.5 0-2.9-.5-4-1.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

export function VideoShowcase() {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>('script[src="https://www.tiktok.com/embed.js"]');
    if (existing) {
      window.tiktokEmbedLoad?.();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.tiktok.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <section className="border-y border-border bg-surface">
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
              <span className="h-2 w-2 rounded-full bg-red-600" /> SMG TV
            </span>
            <h2 className="mt-3 text-4xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
              We Film <span className="brand-gradient-text">Every Job.</span>
            </h2>
            <p className="mt-4 max-w-xl text-muted">
              Real tints, real wraps, real reveals — straight from the shop to your feed, no filters.
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href={siteConfig.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-foreground transition-colors hover:border-brand-pink/60"
            >
              <TikTokIcon />
              <div className="text-left leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">TikTok</p>
                <p className="text-sm font-semibold">@shazmotorgroup</p>
              </div>
            </a>
            <a
              href={siteConfig.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3 text-foreground transition-colors hover:border-brand-pink/60"
            >
              <InstagramIcon />
              <div className="text-left leading-tight">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">Instagram</p>
                <p className="text-sm font-semibold">@shazmotorgroup</p>
              </div>
            </a>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-border pt-8">
          <div className="flex items-center gap-2 text-foreground">
            <TikTokIcon className="h-4 w-4" />
            <InstagramIcon className="h-4 w-4" />
            <h3 className="text-lg font-bold uppercase tracking-tight">More From The Feed</h3>
          </div>
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">{videoUrls.length} Clips</span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videoUrls.map((url) => (
            <blockquote
              key={url}
              className="tiktok-embed overflow-hidden rounded-3xl border border-border"
              cite={url}
              data-video-id={getVideoId(url)}
              style={{ maxWidth: "100%", minWidth: "100%" }}
            >
              <section />
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

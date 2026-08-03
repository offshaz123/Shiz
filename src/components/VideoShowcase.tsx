import { siteConfig } from "@/lib/site-config";

type FeaturedVideo = {
  tag: string;
  embedUrl: string;
  caption: string;
};

// Add real TikTok/Instagram video/reel links here once supplied — each renders as an embedded
// player instead of the "coming soon" placeholder below.
const videos: FeaturedVideo[] = [];

const tags = ["Featured", "Trending", "New"];

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
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

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
    </svg>
  );
}

function PlaceholderCard({ tag }: { tag: string }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-background">
      <span className="absolute left-3 top-3 z-10 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
        ▶ {tag}
      </span>
      <div className="flex aspect-9/16 flex-col items-center justify-center gap-3 p-8 text-center">
        <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8 text-muted">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10 8.5v7l6-3.5-6-3.5Z" fill="currentColor" />
        </svg>
        <p className="text-sm text-muted">Real job video — coming soon.</p>
      </div>
    </div>
  );
}

export function VideoShowcase() {
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

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {videos.length === 0
            ? tags.map((tag) => <PlaceholderCard key={tag} tag={tag} />)
            : videos.map((v) => (
                <div key={v.embedUrl} className="relative overflow-hidden rounded-3xl border border-border bg-background">
                  <span className="absolute left-3 top-3 z-10 rounded-md bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    ▶ {v.tag}
                  </span>
                  <iframe
                    src={v.embedUrl}
                    title={v.caption}
                    className="aspect-9/16 w-full"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}

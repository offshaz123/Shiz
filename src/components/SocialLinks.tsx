import { siteConfig } from "@/lib/site-config";

const icons: Record<string, { label: string; path: string; viewBox?: string }> = {
  facebook: {
    label: "Facebook",
    path: "M14 9h2.5V6H14c-2.2 0-3.5 1.4-3.5 3.6V11H8.5v3h2V22h3v-8h2.3l.5-3h-2.8V9.8c0-.5.2-.8.5-.8Z",
  },
  instagram: {
    label: "Instagram",
    path: "M12 7.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 7.4A2.9 2.9 0 1 1 14.9 12 2.9 2.9 0 0 1 12 14.9ZM16.7 6.2a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1ZM8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 1.7A3.3 3.3 0 0 0 4.7 8v8A3.3 3.3 0 0 0 8 19.3h8a3.3 3.3 0 0 0 3.3-3.3V8A3.3 3.3 0 0 0 16 4.7Z",
  },
  linkedin: {
    label: "LinkedIn",
    path: "M6.9 8.5H4.1V20h2.8V8.5ZM5.5 4a1.7 1.7 0 1 0 1.7 1.7A1.7 1.7 0 0 0 5.5 4ZM20 13.6c0-3-1.6-4.4-3.8-4.4a3.3 3.3 0 0 0-3 1.6V8.5H10.5V20h2.8v-6a1.9 1.9 0 0 1 1.9-2.1c1 0 1.9.6 1.9 2.1v6H20Z",
  },
  x: {
    label: "X",
    path: "M17.5 3h3l-6.6 7.6L21.6 21h-6l-4.3-5.6L6.3 21H3.2l7-8.1L2.8 3h6.2l3.9 5.2ZM16.4 19.3h1.7L7.7 4.6H5.9Z",
  },
  youtube: {
    label: "YouTube",
    path: "M21.6 7.9a2.5 2.5 0 0 0-1.8-1.8C18.2 5.7 12 5.7 12 5.7s-6.2 0-7.8.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2 12a26 26 0 0 0 .4 4.1 2.5 2.5 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.1ZM10 15V9l5.2 3Z",
  },
  tiktok: {
    label: "TikTok",
    path: "M16.5 3h-3v12.2a2.3 2.3 0 1 1-2.3-2.3 2.6 2.6 0 0 1 .7.1V9.9a5.7 5.7 0 0 0-.7 0 5.4 5.4 0 1 0 5.4 5.4V9.6a6.8 6.8 0 0 0 4 1.3V7.8a3.9 3.9 0 0 1-4-3.9Z",
  },
};

/** Renders only the profiles that have a URL set in site-config. */
export function SocialLinks({ className = "" }: { className?: string }) {
  const entries = Object.entries(siteConfig.social).filter(
    ([key, url]) => url && icons[key]
  );
  if (entries.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {entries.map(([key, url]) => (
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={icons[key].label}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-muted transition-colors hover:border-brand-pink/60 hover:text-brand-pink"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
            <path fill="currentColor" d={icons[key].path} />
          </svg>
        </a>
      ))}
    </div>
  );
}

import { siteConfig, whatsappHref } from "@/lib/site-config";
import { TrackedCallLink } from "./TrackedCallLink";

export function QuoteSidebar() {
  return (
    <div className="space-y-5">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand/40"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
          <svg viewBox="0 0 32 32" fill="white" className="h-5 w-5">
            <path d="M16.02 3C9.4 3 4 8.4 4 15.02c0 2.28.63 4.4 1.72 6.22L4 29l7.94-1.66a12.9 12.9 0 0 0 4.08.66C22.6 28 28 22.6 28 15.98 28 9.36 22.64 3 16.02 3Z" />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-foreground">WhatsApp</p>
          <p className="text-sm text-muted">Message us — {siteConfig.phoneDisplay}</p>
        </div>
      </a>

      <TrackedCallLink className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand/40">
        <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
            <path
              d="M4.5 4.5c1-1 3.5-1 4.2.9.4 1.1.9 2 1.5 2.8.5.7.4 1.6-.2 2.2l-.9.9a12 12 0 0 0 5.6 5.6l.9-.9c.6-.6 1.5-.7 2.2-.2.8.6 1.7 1.1 2.8 1.5 1.9.7 1.9 3.2.9 4.2-1 1-2.6 1.6-4.3 1.2C11.7 21.4 4.6 14.3 3.3 8.8c-.4-1.7.2-3.3 1.2-4.3Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-foreground">Call us</p>
          <p className="text-sm text-muted">{siteConfig.phoneDisplay}</p>
        </div>
      </TrackedCallLink>

      <a
        href={`mailto:${siteConfig.email}`}
        className="flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand/40"
      >
        <span className="brand-gradient-bg flex h-11 w-11 shrink-0 items-center justify-center rounded-full">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
            <path
              d="M4 6h16v12H4V6Zm0 0 8 7 8-7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <div>
          <p className="font-semibold text-foreground">Email</p>
          <p className="break-all text-sm text-muted">{siteConfig.email}</p>
        </div>
      </a>

      <div className="rounded-3xl border border-border bg-surface p-6">
        <p className="font-semibold text-foreground">Opening hours</p>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          {siteConfig.hours.map((h) => (
            <li key={h.day} className="flex justify-between gap-4">
              <span>{h.day}</span>
              <span>{h.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

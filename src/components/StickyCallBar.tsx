import { TrackedCallLink } from "@/components/TrackedCallLink";
import { siteConfig, whatsappHref } from "@/lib/site-config";

/**
 * Persistent call bar, mobile only.
 *
 * 97% of paid traffic arrives on a phone and the page is built to produce
 * calls, but every call-to-action was inline — a visitor had to be scrolled to
 * one to act. This keeps the dialler one thumb-press away wherever they are on
 * the page. Hidden from `sm` up, where the header CTA is always visible.
 */
export function StickyCallBar() {
  return (
    <>
      {/* Spacer so the bar never covers the last of the page content. */}
      <div aria-hidden className="h-24 sm:hidden" />

      <div data-sticky-call-bar className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:hidden">
        <div className="flex items-center gap-3">
          <TrackedCallLink className="brand-gradient-bg flex flex-1 items-center justify-center gap-2.5 rounded-full py-3.5 text-base font-bold shadow-lg shadow-black/20">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
              <path
                d="M4.5 4.5c1-1 3.5-1 4.2.9.4 1.1.9 2 1.5 2.8.5.7.4 1.6-.2 2.2l-.9.9a12 12 0 0 0 5.6 5.6l.9-.9c.6-.6 1.5-.7 2.2-.2.8.6 1.7 1.1 2.8 1.5 1.9.7 1.9 3.2.9 4.2-1 1-2.6 1.6-4.3 1.2C11.7 21.4 4.6 14.3 3.3 8.8c-.4-1.7.2-3.3 1.2-4.3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            Call {siteConfig.phoneDisplay}
          </TrackedCallLink>

          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message us on WhatsApp"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-lg shadow-black/20"
          >
            <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden className="h-6 w-6 text-white">
              <path d="M16 3C8.8 3 3 8.8 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.8A13 13 0 1 0 16 3Zm0 23.7c-2.1 0-4.1-.6-5.9-1.6l-.4-.3-4 1 1.1-3.9-.3-.4A10.7 10.7 0 1 1 16 26.7Zm6-8c-.3-.2-1.9-1-2.2-1.1-.3-.1-.5-.2-.7.1-.2.3-.8 1.1-1 1.3-.2.2-.4.2-.7.1a8.7 8.7 0 0 1-4.3-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.8s1.2 3.3 1.4 3.5c.2.2 2.4 3.7 5.9 5.1 2.2.9 3 1 4.1.9.7-.1 2.1-.9 2.4-1.7.3-.8.3-1.5.2-1.7-.1-.1-.3-.2-.6-.4Z" />
            </svg>
          </a>
        </div>
      </div>
    </>
  );
}

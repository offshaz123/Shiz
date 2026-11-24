import { siteConfig } from "@/lib/site-config";

/**
 * "Ask AI about us."
 *
 * People increasingly check a company by asking an assistant rather than
 * by reading its About page, and the answer they get is assembled from
 * whatever the model can find. This hands them the question already
 * written, pointed at the three assistants most of them use.
 *
 * The question is printed on the page rather than hidden in the link, for
 * two reasons. It tells somebody exactly what is about to be sent on their
 * behalf, which a link that silently fills a prompt box does not. And it
 * is the honest version: there is nothing in it steering the answer, no
 * "why are they the best", just the things a buyer actually wants to know.
 *
 * Every assistant here takes the question as a query parameter and opens
 * with it in the box, waiting to be sent. Nothing is submitted for them.
 */

/**
 * What gets asked.
 *
 * Deliberately neutral. A planted question produces a planted answer, and
 * anybody who notices it has learned something about us that is worse than
 * whatever the honest answer would have been.
 */
const QUESTION = [
  `Tell me about ${siteConfig.name} (${siteConfig.url}) — a UK marketing agency.`,
  "What do they actually do, who do they work with, what do they charge,",
  "and how do they compare with other agencies for a small local business?",
].join(" ");

type Assistant = {
  name: string;
  href: string;
  /** The brand's own mark, drawn rather than loaded, so the row does not
   *  depend on three other companies' CDNs staying up. */
  mark: React.ReactNode;
};

const ASSISTANTS: Assistant[] = [
  {
    name: "ChatGPT",
    href: `https://chatgpt.com/?q=${encodeURIComponent(QUESTION)}`,
    mark: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
        <path d="M22.28 9.82a5.98 5.98 0 0 0-.52-4.91 6.05 6.05 0 0 0-6.51-2.9A6 6 0 0 0 4.98 3.7a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .75 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.52 2.9A5.98 5.98 0 0 0 13.26 24a6.05 6.05 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07Zm-9.02 12.6a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.79.79 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5ZM3.6 18.3a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.77.77 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.64ZM2.34 7.9a4.48 4.48 0 0 1 2.34-1.97v5.68a.77.77 0 0 0 .38.67l5.82 3.36-2.02 1.17a.08.08 0 0 1-.07 0L3.96 14.02a4.5 4.5 0 0 1-1.62-6.13Zm16.6 3.86-5.84-3.4L15.11 7.2a.07.07 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.78.78 0 0 0-.4-.66Zm2.01-3.03-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.42 9.24V6.9a.07.07 0 0 1 .03-.06l4.83-2.78a4.5 4.5 0 0 1 6.68 4.66ZM8.32 12.87 6.3 11.7a.08.08 0 0 1-.04-.06V6.08a4.5 4.5 0 0 1 7.37-3.45l-.14.08L8.71 5.47a.79.79 0 0 0-.39.68v6.72Zm1.1-2.36 2.6-1.5 2.61 1.5v3l-2.6 1.5-2.61-1.5v-3Z" />
      </svg>
    ),
  },
  {
    name: "Claude",
    href: `https://claude.ai/new?q=${encodeURIComponent(QUESTION)}`,
    mark: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="currentColor">
        <path d="M12 2.4 13.9 8l5.9.2-4.7 3.5 1.7 5.7-4.8-3.4-4.8 3.4 1.7-5.7L4.2 8.2 10.1 8 12 2.4Zm0 5.2-.6 1.8-1.9.1 1.5 1.1-.5 1.8 1.5-1.1 1.5 1.1-.5-1.8 1.5-1.1-1.9-.1-.6-1.8Z" />
        <path d="M12 13.2 10.6 22h2.8L12 13.2Z" />
      </svg>
    ),
  },
  {
    name: "Perplexity",
    href: `https://www.perplexity.ai/search?q=${encodeURIComponent(QUESTION)}`,
    mark: (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 3v18M12 7.5 5.5 3v8.5M12 7.5 18.5 3v8.5M12 16.5 5.5 21v-8.5M12 16.5 18.5 21v-8.5" />
        <rect x="3" y="8.5" width="18" height="7" rx="1.5" />
      </svg>
    ),
  },
];

export function AskAi({ className = "" }: { className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur-sm sm:p-5 ${className}`}
    >
      <div className="flex items-center gap-2">
        {/* A small animated mark, so the block reads as something live
            rather than as another box of text. */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-pink opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-pink" />
        </span>
        <p className="text-sm font-bold text-foreground">Don&apos;t take our word for it</p>
      </div>

      <p className="mt-2 text-sm leading-relaxed text-muted">
        Ask an AI assistant about us and see what it says. Here is the question — we have not
        weighted it in our favour, and nothing is sent until you press send.
      </p>

      {/* The question, visible. Somebody should be able to read what is
          about to be put in their chat box before they open it. */}
      <p className="mt-3 rounded-xl border border-border bg-background px-4 py-3 text-sm italic leading-relaxed text-foreground">
        &ldquo;{QUESTION}&rdquo;
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {ASSISTANTS.map((assistant) => (
          <a
            key={assistant.name}
            href={assistant.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition hover:border-brand-pink/60 hover:text-brand-pink"
          >
            <span className="transition-transform group-hover:scale-110">{assistant.mark}</span>
            Ask {assistant.name}
            <svg
              viewBox="0 0 24 24"
              className="h-3 w-3 opacity-50 transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        ))}
      </div>
    </div>
  );
}

import { siteConfig } from "@/lib/site-config";

/**
 * Sits beside the finished report. The message is pre-written with the domain
 * and the score so the conversation starts with context rather than "hi".
 */
export function ScanSupportButton({ domain, score }: { domain: string; score: number }) {
  const message = `Hi, I've just run the website scan on ${domain} and it came back ${score}/100. What's next?`;
  const href = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start gap-4 rounded-3xl border border-border bg-surface p-6 transition-colors hover:border-brand-pink/50"
    >
      <span className="relative shrink-0">
        <svg viewBox="0 0 72 72" className="h-16 w-16" aria-hidden="true">
          <defs>
            <linearGradient id="agent-bg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--brand-purple)" />
              <stop offset="55%" stopColor="var(--brand-pink)" />
              <stop offset="100%" stopColor="var(--brand-orange)" />
            </linearGradient>
          </defs>
          <circle cx="36" cy="36" r="36" fill="url(#agent-bg)" />
          {/* head */}
          <circle cx="36" cy="30" r="11" fill="#fff" opacity="0.95" />
          {/* shoulders */}
          <path d="M16 60c0-10 9-16 20-16s20 6 20 16Z" fill="#fff" opacity="0.95" />
          {/* headset band and earpieces */}
          <path
            d="M22 30a14 14 0 0 1 28 0"
            fill="none"
            stroke="#0b0a0f"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.85"
          />
          <rect x="18.5" y="28" width="6" height="10" rx="3" fill="#0b0a0f" opacity="0.85" />
          <rect x="47.5" y="28" width="6" height="10" rx="3" fill="#0b0a0f" opacity="0.85" />
          {/* mic */}
          <path
            d="M47 38v3a5 5 0 0 1-5 5h-3"
            fill="none"
            stroke="#0b0a0f"
            strokeWidth="2.6"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>
        <span className="absolute -bottom-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] ring-4 ring-surface">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              fill="#fff"
              d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Zm4.6 12.1c-.3-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5 0a6.7 6.7 0 0 1-2-1.2 7.4 7.4 0 0 1-1.4-1.7c-.1-.3 0-.4.1-.5l.4-.5a1.8 1.8 0 0 0 .2-.4.5.5 0 0 0 0-.4c0-.1-.6-1.4-.8-1.9s-.4-.4-.5-.4h-.5a1 1 0 0 0-.7.3A2.9 2.9 0 0 0 6.9 10a5 5 0 0 0 1 2.7 11.5 11.5 0 0 0 4.4 3.9 9.9 9.9 0 0 0 1.5.5 3.5 3.5 0 0 0 1.6.1 2.6 2.6 0 0 0 1.7-1.2 2.1 2.1 0 0 0 .2-1.2c-.1-.1-.3-.2-.5-.3Z"
            />
          </svg>
        </span>
      </span>

      <span className="min-w-0">
        <span className="block font-semibold text-foreground group-hover:text-brand-pink">
          Got your results? Let&apos;s talk through them
        </span>
        <span className="mt-1.5 block text-sm leading-relaxed text-muted">
          Message us on WhatsApp and we&apos;ll tell you which of these actually matter for your
          business and which you can ignore. No charge for that conversation.
        </span>
        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-pink">
          Open WhatsApp <span aria-hidden="true">→</span>
        </span>
      </span>
    </a>
  );
}

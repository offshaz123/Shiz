export function GoogleCalendarBadge({ size = "sm" }: { size?: "sm" | "lg" }) {
  const iconClass = size === "lg" ? "h-14 w-14 shrink-0" : "h-4 w-4 shrink-0";
  const textClass = size === "lg" ? "text-sm text-muted" : "text-xs text-muted";
  return (
    <div className="mt-4 flex items-center justify-center gap-2.5">
      <svg viewBox="0 0 48 48" className={iconClass} aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5Z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.3 16 18.8 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7Z"
        />
        <path
          fill="#4CAF50"
          d="M24 45c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.6 35.6 26.9 37 24 37c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 40.6 16.2 45 24 45Z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.9l6.5 5.5C41.7 36.7 45 31 45 24c0-1.4-.1-2.7-.4-3.5Z"
        />
      </svg>
      <span className={textClass}>Instant booking via Google Calendar</span>
    </div>
  );
}

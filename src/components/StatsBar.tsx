const stats = [
  { value: "200+", label: "Projects", sub: "Delivered", stars: false },
  { value: "97%", label: "Satisfaction", sub: "Client feedback rating", stars: true },
  { value: "15+", label: "Industries", sub: "Served UK-wide", stars: false },
  { value: "300+", label: "Clients", sub: "Worked with to date", stars: false },
];

function Stars() {
  return (
    <div className="mt-2 flex justify-center gap-0.5 lg:justify-start" aria-label="5 out of 5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-[#f7941e]" aria-hidden="true">
          <path d="M10 1.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L10 14.9l-5.25 2.75 1-5.85L1.5 7.65l5.9-.85L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

const partners = [
  {
    name: "Google",
    role: "Partner",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.87z" />
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.08 7.95-2.91l-3.88-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24z" />
        <path fill="#FBBC05" d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56V6.63H1.29a12 12 0 0 0 0 10.74l3.98-3.09z" />
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.29 6.63l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
      </svg>
    ),
  },
  {
    name: "Meta",
    role: "Business Partner",
    mark: (
      <svg viewBox="0 0 36 24" className="h-6 w-9" aria-hidden="true">
        <path
          fill="#0081FB"
          d="M4.1 15.3c0 1.42.31 2.5.72 3.16.53.86 1.33 1.22 2.14 1.22 1.05 0 2-.26 3.85-2.81 1.48-2.05 3.22-4.92 4.4-6.72l1.99-3.06c1.38-2.13 2.99-4.5 4.83-6.1C23.53.68 25.15 0 26.78 0c2.73 0 5.34 1.58 7.33 4.55C36.3 7.8 37.25 11.9 37.25 16.1c0 2.5-.49 4.34-1.33 5.79-.81 1.4-2.39 2.8-5.04 2.8v-4c2.27 0 2.84-2.09 2.84-4.48 0-3.41-.8-7.2-2.55-9.9-1.24-1.92-2.85-3.09-4.62-3.09-1.92 0-3.46 1.44-5.2 4.02-.92 1.37-1.87 3.03-2.93 4.91l-1.17 2.08c-2.36 4.18-2.96 5.13-4.14 6.7C10.05 23.7 8.3 24 6.86 24c-2.75 0-4.49-1.19-5.57-2.99C.41 19.55 0 17.63 0 15.44l4.1-.14z"
        />
        <path
          fill="#0064E1"
          d="M3.24 4.83C5.09 1.99 7.75 0 10.8 0c1.77 0 3.52.52 5.36 2.02 2.01 1.64 4.15 4.33 6.82 8.77l.96 1.6c2.31 3.85 3.63 5.83 4.4 6.76.99 1.2 1.68 1.55 2.58 1.55 2.27 0 2.84-2.09 2.84-4.48l3.62-.11c0 2.5-.49 4.34-1.33 5.79-.81 1.4-2.39 2.8-5.04 2.8-1.65 0-3.11-.36-4.73-1.88-1.24-1.17-2.7-3.24-3.82-5.12l-3.33-5.56c-1.67-2.79-3.2-4.87-4.09-5.81-.95-1.01-2.18-2.23-4.13-2.23-1.58 0-2.92 1.11-4.04 2.8L3.24 4.83z"
        />
      </svg>
    ),
  },
  {
    name: "WordPress",
    role: "Expert",
    mark: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
        <path
          fill="#21759B"
          d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zM1.21 12c0-1.56.33-3.05.94-4.39l5.14 14.09A10.8 10.8 0 0 1 1.21 12zM12 22.79c-1.06 0-2.08-.15-3.05-.44l3.24-9.41 3.32 9.09c.02.05.05.1.07.14-1.12.4-2.33.62-3.58.62zm1.49-15.85c.65-.03 1.24-.1 1.24-.1.58-.07.51-.93-.07-.89 0 0-1.75.14-2.88.14-1.06 0-2.84-.14-2.84-.14-.58-.04-.65.85-.07.89 0 0 .55.07 1.14.1l1.7 4.66-2.39 7.17-3.98-11.83c.65-.03 1.24-.1 1.24-.1.58-.07.51-.93-.07-.89 0 0-1.75.14-2.88.14-.2 0-.44-.01-.7-.01A10.79 10.79 0 0 1 12 1.21c2.82 0 5.39 1.08 7.32 2.84h-.14c-1.06 0-1.81.92-1.81 1.91 0 .89.51 1.64 1.06 2.53.41.72.89 1.64.89 2.98 0 .92-.36 1.99-.82 3.48l-1.08 3.6-3.93-11.61zm5.27 13.76l3.29-9.52c.62-1.54.82-2.77.82-3.86 0-.4-.03-.77-.07-1.11a10.73 10.73 0 0 1 1.33 5.19c0 3.84-2.08 7.19-5.17 9.01l-.2.29z"
        />
      </svg>
    ),
  },
];

export function StatsBar() {
  return (
    <section className="relative overflow-hidden border-y border-border bg-surface">
      <div
        aria-hidden
        className="brand-gradient-bg pointer-events-none absolute -bottom-32 left-1/2 h-[320px] w-[900px] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
      />

      <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <p className="text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
          Trusted by UK businesses · Certified across the platforms that matter
        </p>

        <div className="mt-11 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center lg:text-left">
              <div className="flex items-baseline justify-center gap-2.5 lg:justify-start">
                <span className="text-base font-semibold text-foreground">{stat.label}</span>
                <span className="brand-gradient-text text-4xl font-bold tracking-tight">
                  {stat.value}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-muted">{stat.sub}</p>
              {stat.stars && <Stars />}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-9 sm:gap-4">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="flex items-center gap-3 rounded-2xl border border-border bg-background px-5 py-3.5"
            >
              {partner.mark}
              <span className="text-left leading-tight">
                <span className="block text-sm font-semibold text-foreground">{partner.name}</span>
                <span className="block text-xs text-muted">{partner.role}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

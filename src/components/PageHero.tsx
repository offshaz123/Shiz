export function PageHero({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="gold-bg pointer-events-none absolute -top-56 left-1/2 h-[420px] w-[800px] -translate-x-1/2 rounded-full opacity-15 blur-3xl"
      />
      <div className="relative mx-auto max-w-3xl px-4 pb-10 pt-14 text-center sm:px-6 sm:pt-20">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1 className="mt-3 font-display text-4xl font-bold uppercase sm:text-6xl">{title}</h1>
        {children && <p className="mx-auto mt-4 max-w-xl text-lg text-muted">{children}</p>}
      </div>
    </section>
  );
}

import Link from "next/link";

type Problem = {
  title: string;
  body: string;
  fix: string;
  href: string;
  icon: React.ReactNode;
  highlight?: boolean;
};

const icon = (d: string) => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const problems: Problem[] = [
  {
    title: "Enquiries come in and go cold",
    body: "Someone messages at 8pm. Nobody sees it until Tuesday. By then they've booked elsewhere.",
    fix: "One inbox, answered fast",
    href: "/services",
    icon: icon("M3 8l9 6 9-6M3 8v9a2 2 0 002 2h14a2 2 0 002-2V8M3 8l9-5 9 5"),
    highlight: true,
  },
  {
    title: "Boosting posts does nothing",
    body: "Boost optimises for likes. It can't run lead forms, can't track enquiries, can't test properly.",
    fix: "Real campaigns, not boosts",
    href: "/blog/boosting-a-post-vs-real-ad-campaign",
    icon: icon("M12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9-9 4.03-9 9 4.03 9 9 9zM9.5 9.5l5 2.5-5 2.5V9.5z"),
  },
  {
    title: "No idea which ads actually work",
    body: "Without tracking installed properly, the numbers in Ads Manager aren't telling you the truth.",
    fix: "Pixel + Conversions API",
    href: "/blog/what-the-meta-pixel-actually-does",
    icon: icon("M3 3v16a2 2 0 002 2h16M7 15l3.5-4 3 2.5L20 7"),
  },
  {
    title: "Site gets visits but no enquiries",
    body: "You can run a perfect campaign and still get nothing if the page after the click leaks.",
    fix: "Landing pages built to convert",
    href: "/blog/signs-your-landing-page-is-losing-leads",
    icon: icon("M4 5h16v11H4zM9 21h6M12 16v5M8 9h8M8 12h5"),
  },
  {
    title: "Leads arrive but never answer",
    body: "Pre-filled forms make it easy to submit without meaning it. You end up ringing dead numbers.",
    fix: "Higher-intent forms",
    href: "/blog/why-meta-ads-get-low-quality-leads",
    icon: icon("M15.5 16.5l-2 2a2 2 0 01-2.3.4A16 16 0 015 12.8a2 2 0 01.4-2.3l2-2M3 3l18 18"),
  },
  {
    title: "Your ads keep getting rejected",
    body: "Some sectors sit under rules most agencies learn about by getting an account restricted.",
    fix: "Category compliance handled",
    href: "/blog/why-meta-ads-get-rejected",
    icon: icon("M12 3l8 4v5c0 4.4-3.2 8.3-8 9.5-4.8-1.2-8-5.1-8-9.5V7l8-4zM9.5 12l1.8 1.8L15 10"),
  },
];

export function ProblemGrid() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
      <div className="max-w-3xl">
        <span className="inline-flex rounded-full border border-brand-pink/30 bg-brand-pink/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-brand-pink">
          Sound familiar?
        </span>
        <h2 className="mt-6 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Getting seen, but not getting{" "}
          <span className="brand-gradient-text">enquiries?</span>
        </h2>
        <p className="mt-5 text-lg text-muted">
          Most businesses aren&apos;t short of attention. They&apos;re losing people somewhere
          between the ad and the booking. Here&apos;s what we usually find, and what we do
          about it.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {problems.map((problem) => (
          <Link
            key={problem.title}
            href={problem.href}
            className={`group flex flex-col rounded-2xl border bg-surface p-7 transition-colors ${
              problem.highlight
                ? "border-brand-pink/45"
                : "border-border hover:border-brand-pink/40"
            }`}
          >
            <span className="brand-gradient-bg inline-flex h-10 w-10 items-center justify-center rounded-xl text-white">
              {problem.icon}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{problem.title}</h3>
            <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{problem.body}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-pink">
              <span aria-hidden="true">→</span>
              <span className="group-hover:underline">{problem.fix}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

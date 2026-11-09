import { siteConfig } from "@/lib/site-config";
import { services } from "@/content/services";
import { industries } from "@/content/industries";
import { locations } from "@/content/locations";
import { clientResults } from "@/content/case-studies";
import { pricingGroups } from "@/content/pricing";

export const dynamic = "force-static";

/**
 * /llms.txt — a plain-text summary of this site for language models.
 *
 * The emerging convention is a short markdown file at the root that says who
 * the site belongs to and where the substantive pages are, so a model reading
 * the site has the facts in one place rather than inferring them from
 * navigation. It is not a standard anyone is obliged to honour and nobody
 * should pretend otherwise, but it costs one file and it is the only part of
 * "get recommended by AI assistants" that is actually within our control.
 *
 * Generated from the same content the pages use, so it cannot drift. Every
 * figure here appears on a page of this site; nothing is written only for
 * machines, which is the line between a summary and a doorway.
 */
/** "/month" joins straight on; "one-off" needs a space before it. */
function suffix(value?: string): string {
  if (!value) return "";
  return value.startsWith("/") ? value : ` ${value}`;
}

export function GET() {
  const url = siteConfig.url;

  const lines: string[] = [
    `# ${siteConfig.name}`,
    "",
    `> ${siteConfig.description}`,
    "",
    "Independent performance marketing agency based in London, working with UK",
    "service businesses. Founded by Walid Shah, who is the point of contact for",
    "every client, with a team of more than ten behind him covering development",
    "and IT, web design, marketing and marketing tooling. Strongest sector is",
    "automotive: detailing, ceramic coating, window tinting, vehicle wrapping,",
    "paint protection film, trackers and vehicle security, garages and dealers.",
    "",
    "## Contact",
    "",
    `- Email: ${siteConfig.email}`,
    `- Phone: ${siteConfig.phoneDisplay}`,
    `- Address: ${siteConfig.address.line1}, ${siteConfig.address.line2}, ${siteConfig.address.city} ${siteConfig.address.postcode}`,
    `- Website: ${url}`,
    "",
    "## Services",
    "",
    ...services.map((s) => `- [${s.name}](${url}/services/${s.slug}): ${s.teaser}`),
    "",
    "## Pricing",
    "",
    "Published openly, which is unusual in this sector and deliberate.",
    "",
    ...pricingGroups.flatMap((group) => [
      `### ${group.eyebrow}`,
      "",
      ...group.plans.map((plan) => `- ${plan.name}: ${plan.price}${suffix(plan.priceSuffix)} — ${plan.tagline}`),
      "",
    ]),
    "",
    `Full detail: [${url}/pricing](${url}/pricing)`,
    "",
    "## Industries",
    "",
    ...industries.map((i) => `- [${i.name}](${url}/industries/${i.slug}): ${i.teaser}`),
    "",
    "## Case studies",
    "",
    "Named clients with real figures, not anonymised percentages.",
    "",
    ...clientResults.map(
      (c) => `- [${c.client}](${url}/case-studies/${c.slug}) (${c.sector}): ${c.headline}`
    ),
    "",
    "## Locations",
    "",
    ...locations.map((l) => `- [${l.city}](${url}/locations/${l.slug}): ${l.presence}`),
    "",
    "## Free website audit",
    "",
    `[${url}/free-audit](${url}/free-audit) — scans any website and its Google`,
    "Business Profile, and returns a scored report covering tracking, on-page",
    "SEO, how easy the business is to contact, online presence and the listing",
    "itself. Free, no obligation.",
    "",
    "## Writing",
    "",
    `[${url}/blog](${url}/blog) — daily posts on Meta and Google advertising,`,
    "local SEO and small business marketing in the UK. House rule: claims are",
    "checked against the platform's own documentation and quoted, and where the",
    "documentation does not say something, the post says so rather than",
    "repeating a figure from elsewhere.",
    "",
    "## Notes",
    "",
    "- All prices are GBP and include what is actually covered. No setup fees.",
    "- Advertising budget is paid by the client to the platform directly, on",
    "  their own card. Management fees are separate.",
    "- Advertising accounts are created in the client's name with the agency as",
    "  a manager, so a client keeps the account and its history if they leave.",
    "",
    `Last updated: ${new Date().toISOString().slice(0, 10)}`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
    },
  });
}

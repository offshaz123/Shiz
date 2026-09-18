/**
 * Client projects — websites built, campaigns delivered, systems set up.
 *
 * This is a portfolio of real work, so entries only go in once the project is
 * genuinely finished and the client is happy for it to be shown. Nothing
 * speculative and nothing invented.
 *
 * While this array is empty the Projects page is not linked from the nav, not
 * listed in the sitemap, and returns a 404 — so there is no thin page sitting
 * in Google's index waiting for content. Adding the first entry switches all
 * of that on automatically.
 */
export type Project = {
  slug: string;
  name: string;
  /** e.g. "Website build" or "Meta ads + CRM" */
  type: string;
  sector: string;
  /** One line for the card. */
  teaser: string;
  metaDescription: string;
  /** What the business needed. */
  brief: string;
  /** What we actually did. */
  work: string[];
  /** Only real, client-approved figures. Leave empty if there are none yet. */
  results?: { value: string; label: string }[];
  /** Live site, if there is one and the client is happy to be linked. */
  url?: string;
  /** Screenshot in /public, e.g. "/projects/everclean.jpg" */
  image?: string;
};

export const projects: Project[] = [];

export function getProject(slug: string) {
  return projects.find((p) => p.slug === slug);
}

export const hasProjects = projects.length > 0;

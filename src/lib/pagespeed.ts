/**
 * Google's own speed measurement, on demand.
 *
 * The audit already times the first response, which answers "did the server
 * answer quickly" and nothing else. It cannot see how long the page takes to
 * become usable, which is the thing visitors actually feel and the thing
 * Google measures. PageSpeed Insights runs a real browser against the page
 * and, where Google has enough traffic from real Chrome users on that site,
 * hands back what those people actually experienced.
 *
 * Deliberately not part of the batch scanner. A call takes ten to thirty
 * seconds — it is loading the page in a browser somewhere — so running it
 * over a list of forty prospects would take twenty minutes and hold a
 * request open on hosting that kills long ones. It is a button you press
 * about one business.
 *
 * Works with no API key at all, which is why there is nothing to set up.
 * PAGESPEED_KEY raises the anonymous quota if this ever gets used heavily.
 */

const API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
const TIMEOUT_MS = 45_000;

export type SpeedMetric = {
  label: string;
  value: string;
  /** Google's own verdict: fast, needs work, slow. */
  rating: "good" | "average" | "poor" | "unknown";
  why: string;
};

export type SpeedReport = {
  /** 0–100, Google's performance score for a phone. */
  score: number;
  /** True when these are real visitors rather than a test run, which is the
   *  difference between "this page can be slow" and "this page is slow". */
  fromRealUsers: boolean;
  metrics: SpeedMetric[];
};

export type SpeedResult =
  | { ok: true; report: SpeedReport }
  | { ok: false; reason: "invalid_url" | "unreachable" | "rate_limited" | "error" };

type RawMetric = { percentile?: number; category?: string };

type RawPsi = {
  lighthouseResult?: {
    categories?: { performance?: { score?: number } };
    audits?: Record<string, { displayValue?: string; numericValue?: number }>;
  };
  loadingExperience?: { metrics?: Record<string, RawMetric> };
  originLoadingExperience?: { metrics?: Record<string, RawMetric> };
};

function rating(category: string | undefined): SpeedMetric["rating"] {
  if (category === "FAST") return "good";
  if (category === "AVERAGE") return "average";
  if (category === "SLOW") return "poor";
  return "unknown";
}

/** Google reports these in milliseconds, except the layout one, which is a
 *  unitless score and reads as nonsense with "ms" after it. */
function seconds(ms: number | undefined): string {
  return typeof ms === "number" ? `${(ms / 1000).toFixed(1)}s` : "—";
}

export async function measureSpeed(url: string): Promise<SpeedResult> {
  const target = url.trim();
  if (!/^https?:\/\//i.test(target)) return { ok: false, reason: "invalid_url" };

  const params = new URLSearchParams({ url: target, strategy: "mobile", category: "performance" });
  const key = process.env.PAGESPEED_KEY;
  if (key) params.set("key", key);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${API}?${params}`, { signal: controller.signal });
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    if (!res.ok) return { ok: false, reason: res.status === 400 ? "unreachable" : "error" };

    const data = (await res.json()) as RawPsi;
    const score = Math.round((data.lighthouseResult?.categories?.performance?.score ?? 0) * 100);

    // Real visitors first, falling back to the whole site, falling back to
    // the test run. The page's own field data is the best answer and the
    // least often available.
    const field = data.loadingExperience?.metrics ?? data.originLoadingExperience?.metrics;
    const fromRealUsers = Boolean(data.loadingExperience?.metrics);
    const audits = data.lighthouseResult?.audits ?? {};

    const metrics: SpeedMetric[] = [
      {
        label: "Time until the page looks ready",
        value: field?.LARGEST_CONTENTFUL_PAINT_MS?.percentile
          ? seconds(field.LARGEST_CONTENTFUL_PAINT_MS.percentile)
          : (audits["largest-contentful-paint"]?.displayValue ?? "—"),
        rating: rating(field?.LARGEST_CONTENTFUL_PAINT_MS?.category),
        why: "How long before the main thing on the page has actually appeared. Over 2.5 seconds and people start leaving.",
      },
      {
        label: "Time until it responds to a tap",
        value: field?.INTERACTION_TO_NEXT_PAINT?.percentile
          ? `${field.INTERACTION_TO_NEXT_PAINT.percentile}ms`
          : (audits["total-blocking-time"]?.displayValue ?? "—"),
        rating: rating(field?.INTERACTION_TO_NEXT_PAINT?.category),
        why: "Tap a button and nothing happens for a moment — that moment. Over 200ms feels broken on a phone.",
      },
      {
        label: "How much the page jumps about",
        value: field?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile
          ? (field.CUMULATIVE_LAYOUT_SHIFT_SCORE.percentile / 100).toFixed(2)
          : (audits["cumulative-layout-shift"]?.displayValue ?? "—"),
        rating: rating(field?.CUMULATIVE_LAYOUT_SHIFT_SCORE?.category),
        why: "Content moving as the page loads, so you press the wrong thing. This is the one that makes people give up on a form.",
      },
    ];

    return { ok: true, report: { score, fromRealUsers, metrics } };
  } catch {
    return { ok: false, reason: "error" };
  } finally {
    clearTimeout(timer);
  }
}

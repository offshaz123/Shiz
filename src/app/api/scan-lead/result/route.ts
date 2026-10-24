import { NextResponse } from "next/server";
import type { AuditResult } from "@/lib/site-audit";
import { withDb } from "@/lib/db";
import { readToken } from "@/lib/lead-tokens";

export const runtime = "nodejs";

/**
 * Attaches a finished audit to the lead that ran it.
 *
 * The follow-up emails are only worth sending because of this. Without the
 * result there is nothing to say beyond "we noticed you visited", which is
 * the kind of email people unsubscribe from. With it, day one can tell them
 * what their own site actually scored and which check failed.
 *
 * The posted result is re-shaped here rather than stored as it arrived: this
 * is a public endpoint, so what the browser sends is a claim, not a fact, and
 * only the fields the emails read are kept.
 */

/** Guards against a huge body being written into the row. */
const MAX_CHECKS_PER_CATEGORY = 12;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | { token?: unknown; result?: unknown }
    | null;

  if (!body || typeof body.token !== "string") {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const leadId = readToken("result", body.token);
  if (!leadId) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const result = body.result as AuditResult | undefined;
  if (!result || typeof result.score !== "number" || !Array.isArray(result.categories)) {
    return NextResponse.json({ success: false }, { status: 400 });
  }

  const stored = {
    finalUrl: String(result.finalUrl ?? "").slice(0, 255),
    score: Number(result.score),
    counts: {
      critical: Number(result.counts?.critical ?? 0),
      warning: Number(result.counts?.warning ?? 0),
      good: Number(result.counts?.good ?? 0),
    },
    categories: result.categories.slice(0, 8).map((category) => ({
      id: String(category.id ?? "").slice(0, 40),
      name: String(category.name ?? "").slice(0, 80),
      score: Number(category.score ?? 0),
      checks: (category.checks ?? []).slice(0, MAX_CHECKS_PER_CATEGORY).map((check) => ({
        label: String(check.label ?? "").slice(0, 120),
        value: String(check.value ?? "").slice(0, 160),
        severity: String(check.severity ?? "unknown").slice(0, 10),
        why: check.why ? String(check.why).slice(0, 400) : undefined,
      })),
    })),
  };

  // Rounded to fit the TINYINT and clamped, since the column is unsigned and a
  // negative or absurd score from a malformed post would otherwise error.
  const score = Math.max(0, Math.min(10, Math.round(stored.score)));

  const saved = await withDb(async (db) => {
    await db.execute(
      "UPDATE scan_leads SET score = ?, audit_json = ? WHERE id = ?",
      [score, JSON.stringify(stored), leadId],
    );
    return true;
  });

  return NextResponse.json({ success: Boolean(saved) });
}

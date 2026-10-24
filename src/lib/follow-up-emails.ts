import { siteConfig } from "./site-config";

/**
 * The day 1, 3 and 6 emails.
 *
 * All three are built from the person's own scan. Nothing here states a
 * statistic, a benchmark or an outcome we cannot point at — if their site
 * scored 4.2 and has no tracking installed, that is worth saying plainly and
 * it is true; "businesses like yours lose 40% of enquiries" is not, and an
 * invented number is the fastest way to lose someone who knows their trade.
 *
 * Day 1 carries the report itself rather than a picture of it. Most email
 * clients block images until the reader asks for them, a screenshot of a
 * dashboard is unreadable on a phone, and a screen reader gets nothing from
 * it at all. Rendered as a table it always arrives.
 *
 * Every email carries an unsubscribe link. Days 3 and 6 are marketing under
 * PECR and may only go to people who ticked the consent box.
 */

export type StoredCheck = {
  label: string;
  value: string;
  severity: string;
  why?: string;
};

export type StoredAudit = {
  finalUrl: string;
  score: number;
  counts: { critical: number; warning: number; good: number };
  categories: { id: string; name: string; score: number; checks: StoredCheck[] }[];
};

export type EmailLead = {
  id: number;
  name: string;
  website: string;
  audit: StoredAudit | null;
};

export type BuiltEmail = { subject: string; html: string; text: string };

const BRAND = "#d9318f";
const INK = "#14111f";
const MUTED = "#6b7280";

function firstName(full: string): string {
  const part = full.trim().split(/\s+/)[0] ?? "";
  return /^[A-Za-z'’-]{2,}$/.test(part) ? part : "there";
}

function domainOf(lead: EmailLead): string {
  const raw = lead.audit?.finalUrl || lead.website;
  return raw.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** The checks worth talking about, worst first, deduplicated by label. */
function problems(audit: StoredAudit | null, limit = 4): StoredCheck[] {
  if (!audit) return [];
  const all = audit.categories.flatMap((category) => category.checks);
  const rank = (severity: string) => (severity === "critical" ? 0 : severity === "warning" ? 1 : 2);
  const seen = new Set<string>();

  return all
    .filter((check) => check.severity === "critical" || check.severity === "warning")
    .sort((a, b) => rank(a.severity) - rank(b.severity))
    .filter((check) => {
      if (seen.has(check.label)) return false;
      seen.add(check.label);
      return true;
    })
    .slice(0, limit);
}

function scoreColour(score: number): string {
  return score >= 7 ? "#059669" : score >= 4 ? "#d97706" : "#dc2626";
}

function shell(body: string, unsubscribeUrl: string, preheader: string): string {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f4f7;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escape(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
<tr><td style="padding:28px 28px 0;">
<span style="font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${BRAND};">Shaz Marketing Group</span>
</td></tr>
<tr><td style="padding:20px 28px 28px;color:${INK};font-size:16px;line-height:1.6;">
${body}
</td></tr>
<tr><td style="padding:20px 28px 28px;border-top:1px solid #e9e9ef;color:${MUTED};font-size:12px;line-height:1.6;">
Shaz Marketing Group · ${escape(siteConfig.address.line1)}, ${escape(siteConfig.address.line2)}, ${escape(siteConfig.address.city)} ${escape(siteConfig.address.postcode)}<br>
<a href="tel:${siteConfig.phoneE164}" style="color:${MUTED};">${escape(siteConfig.phoneDisplay)}</a> ·
<a href="mailto:${siteConfig.email}" style="color:${MUTED};">${escape(siteConfig.email)}</a><br>
<a href="${unsubscribeUrl}" style="color:${MUTED};text-decoration:underline;">Unsubscribe from these emails</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}

/** The report, as a table. */
function reportTable(audit: StoredAudit): string {
  const rows = audit.categories
    // A negative score means the check didn't apply to this site, not that it
    // scored below zero. The web report hides those and so must this.
    .filter((category) => category.score >= 0)
    .map((category) => {
      const colour = scoreColour(category.score);
      return `<tr>
<td style="padding:10px 0;border-bottom:1px solid #e9e9ef;font-size:15px;">${escape(category.name)}</td>
<td style="padding:10px 0;border-bottom:1px solid #e9e9ef;text-align:right;font-size:15px;font-weight:700;color:${colour};">${category.score.toFixed(1)}</td>
</tr>`;
    })
    .join("");

  const colour = scoreColour(audit.score);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid #e9e9ef;border-radius:12px;">
<tr><td style="padding:18px 20px;background:#fafafc;border-radius:12px 12px 0 0;">
<span style="font-size:13px;color:${MUTED};">Overall score</span><br>
<span style="font-size:36px;font-weight:700;color:${colour};">${audit.score.toFixed(1)}</span>
<span style="font-size:15px;color:${MUTED};">out of 10</span>
</td></tr>
<tr><td style="padding:4px 20px 18px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
</td></tr>
</table>`;
}

function problemList(items: StoredCheck[]): string {
  return items
    .map((check) => {
      const colour = check.severity === "critical" ? "#dc2626" : "#d97706";
      return `<tr><td style="padding:0 0 16px;">
<div style="font-weight:700;color:${INK};font-size:15px;">
<span style="color:${colour};">●</span> ${escape(check.label)} — <span style="font-weight:400;color:${MUTED};">${escape(check.value)}</span>
</div>
${check.why ? `<div style="margin-top:4px;color:${MUTED};font-size:14px;line-height:1.55;">${escape(check.why)}</div>` : ""}
</td></tr>`;
    })
    .join("");
}

function problemLinesText(items: StoredCheck[]): string {
  return items
    .map((check) => `- ${check.label} — ${check.value}${check.why ? `\n  ${check.why}` : ""}`)
    .join("\n");
}

// ---------------------------------------------------------------------------

function dayOne(lead: EmailLead, unsubscribeUrl: string): BuiltEmail {
  const domain = domainOf(lead);
  const name = firstName(lead.name);
  const audit = lead.audit;
  const issues = problems(audit);
  const scanUrl = `${siteConfig.url}/free-audit`;

  const intro = audit
    ? `Here's the report for <strong>${escape(domain)}</strong>. It scored <strong>${audit.score.toFixed(1)} out of 10</strong>.`
    : `You ran a check on <strong>${escape(domain)}</strong> the other day.`;

  const body = `
<p style="margin:0 0 14px;">Hi ${escape(name)},</p>
<p style="margin:0 0 14px;">${intro}</p>
${audit ? reportTable(audit) : ""}
${
  !audit
    ? `<p style="margin:0 0 14px;">Your scan didn't finish on our side, so I don't have the results to show you — that's our fault, not anything wrong with your site. Run it again from the link below and it'll come through, or reply here and I'll go through the site myself and write it up for you.</p>`
    : issues.length
      ? `<p style="margin:22px 0 14px;font-weight:700;">What's worth fixing first</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${problemList(issues)}</table>
<p style="margin:22px 0 14px;">Most of these are a few hours' work, not a rebuild. We fix them, put proper tracking in so you can see which enquiries came from where, and you keep the site either way.</p>`
      : `<p style="margin:0 0 14px;">Nothing critical came back, which is rarer than you'd think. The next step for a site in that position is usually getting more people to it rather than changing it — the site itself isn't what's holding you back.</p>`
}
<p style="margin:0 0 22px;">If you want to go through it, reply to this email or call ${escape(siteConfig.phoneDisplay)}. Happy to just tell you what I'd do, whether or not you use us.</p>
<p style="margin:0 0 6px;"><a href="${scanUrl}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:999px;">Run the check again</a></p>
<p style="margin:22px 0 0;">Walid<br><span style="color:${MUTED};">Shaz Marketing Group</span></p>`;

  const text = `Hi ${name},

${audit ? `Here's the report for ${domain}. It scored ${audit.score.toFixed(1)} out of 10.` : `You ran a check on ${domain} the other day.`}
${audit ? `\n${audit.categories.filter((c) => c.score >= 0).map((c) => `${c.name}: ${c.score.toFixed(1)}`).join("\n")}\n` : ""}
${
  !audit
    ? "Your scan didn't finish on our side, so I don't have the results to show you — that's our fault, not anything wrong with your site. Run it again and it'll come through, or reply here and I'll go through the site myself and write it up for you.\n"
    : issues.length
      ? `What's worth fixing first\n\n${problemLinesText(issues)}\n\nMost of these are a few hours' work, not a rebuild. We fix them, put proper tracking in so you can see which enquiries came from where, and you keep the site either way.\n`
      : "Nothing critical came back, which is rarer than you'd think. The next step for a site in that position is usually getting more people to it rather than changing it.\n"
}

If you want to go through it, reply to this email or call ${siteConfig.phoneDisplay}. Happy to just tell you what I'd do, whether or not you use us.

Walid
Shaz Marketing Group

Unsubscribe: ${unsubscribeUrl}`;

  return {
    subject: audit
      ? `${domain} scored ${audit.score.toFixed(1)}/10 — here's the report`
      : `About the check you ran on ${domain}`,
    html: shell(body, unsubscribeUrl, `The full breakdown for ${domain}.`),
    text,
  };
}

function dayThree(lead: EmailLead, unsubscribeUrl: string): BuiltEmail {
  const domain = domainOf(lead);
  const name = firstName(lead.name);
  const audit = lead.audit;
  const issues = problems(audit, 3);

  // Grounded in their own result. No invented figure for what it costs them,
  // because we have no way of knowing that — what we can say is what is
  // missing and what it means, which is enough.
  const headline = audit
    ? `A few days ago ${escape(domain)} came back at ${audit.score.toFixed(1)} out of 10.${issues.length ? " These are the ones I'd deal with first:" : ""}`
    : `A few days ago you ran a check on ${escape(domain)}.`;

  const body = `
<p style="margin:0 0 14px;">Hi ${escape(name)},</p>
<p style="margin:0 0 14px;">${headline}</p>
${
  issues.length
    ? `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;">${problemList(issues)}</table>`
    : ""
}
<p style="margin:0 0 14px;">The reason I'm following up: ${issues.length ? "these are" : "this is"} the sort of thing that costs you quietly. Nobody fills in a form and tells you it was hard to find your phone number, or that Google never showed them your page in the first place. You just get fewer calls than you should, and there's nothing in the inbox to tell you why.</p>
<p style="margin:0 0 22px;">If you've already sorted ${issues.length ? "them" : "it"}, genuinely well done and ignore me. If not, I can walk you through what I'd change in about ten minutes on the phone.</p>
<p style="margin:0 0 6px;"><a href="tel:${siteConfig.phoneE164}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:999px;">Call ${escape(siteConfig.phoneDisplay)}</a></p>
<p style="margin:14px 0 0;color:${MUTED};font-size:14px;">Or just reply here and tell me when suits.</p>
<p style="margin:22px 0 0;">Walid<br><span style="color:${MUTED};">Shaz Marketing Group</span></p>`;

  const text = `Hi ${name},

${audit ? `A few days ago ${domain} came back at ${audit.score.toFixed(1)} out of 10.${issues.length ? " These are the ones I'd deal with first:" : ""}` : `A few days ago you ran a check on ${domain}.`}
${issues.length ? `\n${problemLinesText(issues)}\n` : ""}
The reason I'm following up: ${issues.length ? "these are" : "this is"} the sort of thing that costs you quietly. Nobody fills in a form and tells you it was hard to find your phone number, or that Google never showed them your page in the first place. You just get fewer calls than you should, and there's nothing in the inbox to tell you why.

If you've already sorted ${issues.length ? "them" : "it"}, genuinely well done and ignore me. If not, I can walk you through what I'd change in about ten minutes on the phone.

Call ${siteConfig.phoneDisplay}, or just reply here and tell me when suits.

Walid
Shaz Marketing Group

Unsubscribe: ${unsubscribeUrl}`;

  return {
    subject: `${domain} — the bit that's costing you`,
    html: shell(body, unsubscribeUrl, "The things that cost you quietly."),
    text,
  };
}

function daySix(lead: EmailLead, unsubscribeUrl: string): BuiltEmail {
  const domain = domainOf(lead);
  const name = firstName(lead.name);
  const audit = lead.audit;

  const body = `
<p style="margin:0 0 14px;">Hi ${escape(name)},</p>
<p style="margin:0 0 14px;">Last one from me about ${escape(domain)}${audit ? ` and the ${audit.score.toFixed(1)} it scored` : ""} — I'd rather ask than keep emailing.</p>
<p style="margin:0 0 14px;">Is this something you still want to deal with? Three honest answers and all of them are fine:</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
<tr><td style="padding:0 0 10px;"><strong>Yes, but not now.</strong> <span style="color:${MUTED};">Reply with a month and I'll put a note in and leave you alone until then.</span></td></tr>
<tr><td style="padding:0 0 10px;"><strong>Yes, let's talk.</strong> <span style="color:${MUTED};">Reply or call and we'll go through it.</span></td></tr>
<tr><td style="padding:0 0 10px;"><strong>No.</strong> <span style="color:${MUTED};">Say so, or use the unsubscribe link, and that's the end of it. No hard feelings.</span></td></tr>
</table>
<p style="margin:0 0 22px;">If I don't hear anything I'll assume it's the last one and stop here. The report's yours either way — you don't owe us anything for it.</p>
<p style="margin:0 0 6px;"><a href="tel:${siteConfig.phoneE164}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font-weight:700;padding:13px 24px;border-radius:999px;">Call ${escape(siteConfig.phoneDisplay)}</a></p>
<p style="margin:22px 0 0;">Walid<br><span style="color:${MUTED};">Shaz Marketing Group</span></p>`;

  const text = `Hi ${name},

Last one from me about ${domain}${audit ? ` and the ${audit.score.toFixed(1)} it scored` : ""} — I'd rather ask than keep emailing.

Is this something you still want to deal with? Three honest answers and all of them are fine:

- Yes, but not now. Reply with a month and I'll put a note in and leave you alone until then.
- Yes, let's talk. Reply or call and we'll go through it.
- No. Say so, or use the unsubscribe link, and that's the end of it. No hard feelings.

If I don't hear anything I'll assume it's the last one and stop here. The report's yours either way — you don't owe us anything for it.

Call ${siteConfig.phoneDisplay}.

Walid
Shaz Marketing Group

Unsubscribe: ${unsubscribeUrl}`;

  return {
    subject: `Still worth doing, ${escape(name)}?`,
    html: shell(body, unsubscribeUrl, "Last one from me — yes, later, or no."),
    text,
  };
}

export function buildFollowUp(
  step: number,
  lead: EmailLead,
  unsubscribeUrl: string,
): BuiltEmail | null {
  if (step === 1) return dayOne(lead, unsubscribeUrl);
  if (step === 3) return dayThree(lead, unsubscribeUrl);
  if (step === 6) return daySix(lead, unsubscribeUrl);
  return null;
}

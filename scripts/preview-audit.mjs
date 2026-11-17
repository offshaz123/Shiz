// Runs the real audit against a real site and prints the security section,
// so the new checks are seen working rather than assumed.
import { fetchForAudit } from "../src/lib/scan-site.ts";
import { buildReport } from "../src/lib/site-audit.ts";

const target = process.argv[2] ?? "https://shazmarketing.com";
const page = await fetchForAudit(target, 15000);
const report = buildReport(page);
console.log("site:", page.finalUrl);
console.log("headers seen:", JSON.stringify(page.headers));
for (const cat of report.categories) {
  if (cat.id !== "security" && cat.id !== "fundamentals") continue;
  console.log(`\n== ${cat.name} ==`);
  for (const c of cat.checks) console.log(`  [${c.severity}] ${c.label}: ${c.value}`);
}

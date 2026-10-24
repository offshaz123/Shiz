/**
 * Fires the follow-up sequence. Run once a day by Hostinger's cron.
 *
 * Exists so the secret stays out of the cron command. Hostinger's Node.js
 * cron option passes --env-file, so CRON_SECRET is already in the
 * environment here — putting it in a curl command instead would leave it
 * sitting in the hPanel form, the activity log, and the server's access log
 * on every single run.
 *
 * It calls the site over HTTPS rather than touching the database directly,
 * so there is one copy of the sending logic and the route's own guards still
 * apply. Sending twice is harmless anyway: the unique key on
 * (lead_id, step) means the database refuses a repeat.
 *
 * Exit code is 0 on success and 1 on failure, which is what makes a failed
 * run visible in Hostinger's cron output rather than silently doing nothing.
 */

const SITE = process.env.CRON_SITE_URL || "https://shazmarketing.com";
const SECRET = process.env.CRON_SECRET;

async function main() {
  if (!SECRET) {
    console.error("CRON_SECRET is not set. Add it under Environment variables in hPanel.");
    process.exit(1);
  }

  const url = `${SITE}/api/cron/follow-ups`;

  // The secret goes in a header, not the query string: query strings are
  // written to access logs, headers are not.
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}` },
  });

  const body = await response.text();

  if (!response.ok) {
    console.error(`Follow-ups failed: HTTP ${response.status} ${body}`);
    process.exit(1);
  }

  console.log(`Follow-ups ran: ${body}`);
}

main().catch((err) => {
  console.error("Follow-ups errored:", err);
  process.exit(1);
});

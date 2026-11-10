import { mintToken } from "./lead-tokens";
import { siteConfig } from "./site-config";

/**
 * The one-click unsubscribe link for a prospect.
 *
 * In a file of its own because both the mailer and the row mapper need it,
 * and having the mailer import the row mapper (or the other way round) makes
 * a cycle. Returns "" when there is no CRON_SECRET to sign with — then no
 * email links to a page that could not work, and the text falls back to
 * asking them to reply.
 */
export function prospectUnsubscribeUrl(id: number): string {
  const token = mintToken("unsubscribe-prospect", id);
  return token ? `${siteConfig.url}/unsubscribe?t=${token}` : "";
}

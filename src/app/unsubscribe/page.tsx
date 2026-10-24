import type { Metadata } from "next";
import Link from "next/link";
import { withDb } from "@/lib/db";
import { readToken } from "@/lib/lead-tokens";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Unsubscribe",
  robots: { index: false, follow: false },
};

/**
 * Unsubscribe, on opening the link.
 *
 * Doing it on GET means a link scanner in a corporate mail filter can
 * unsubscribe somebody who never clicked. That is the lesser problem: the
 * cost is a lead quietly stopping, where the cost of a confirmation step
 * somebody abandons is continuing to email a person who asked us not to.
 * When those two are in tension the person wins.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>;
}) {
  const { t } = await searchParams;
  const leadId = t ? readToken("unsubscribe", t) : null;

  let done = false;
  if (leadId) {
    const result = await withDb(async (db) => {
      await db.execute(
        "UPDATE scan_leads SET marketing_consent = 0, unsubscribed_at = NOW() WHERE id = ?",
        [leadId],
      );
      return true;
    });
    done = Boolean(result);
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col justify-center px-5 py-16 text-center">
      {done ? (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            You&apos;re unsubscribed
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            We won&apos;t email you again about your website check. Nothing else needed from
            you.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            We couldn&apos;t process that link
          </h1>
          <p className="mt-4 leading-relaxed text-muted">
            It may have been cut in half by your email app. Email{" "}
            <a href="mailto:info@shazmarketing.com" className="underline hover:text-foreground">
              info@shazmarketing.com
            </a>{" "}
            and we&apos;ll take you off straight away — you don&apos;t need to explain why.
          </p>
        </>
      )}
      <p className="mt-8">
        <Link href="/" className="text-sm text-muted underline hover:text-foreground">
          Back to the website
        </Link>
      </p>
    </div>
  );
}

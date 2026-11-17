import { NextResponse } from "next/server";
import { authConfigured, createResetToken, findByEmail, StorageError } from "@/lib/auth";
import { mailer, mailFrom } from "@/lib/mailer";
import { resetEmail } from "@/lib/resetEmail";
import { brand } from "@/lib/brand";

/**
 * Ask for a reset link.
 *
 * Always answers the same way, whether or not the address has an account.
 * Anything else turns this endpoint into a way of asking "is this person a
 * customer?", and the answer to that is nobody else's business.
 */
const SAME_ANSWER = {
  ok: true,
  message: "If that address has an account, a reset link is on its way.",
};

export async function POST(request: Request) {
  if (!authConfigured()) return NextResponse.json(SAME_ANSWER);

  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const email = body?.email ?? "";
  if (!email) return NextResponse.json(SAME_ANSWER);

  try {
    const user = await findByEmail(email);

    if (user) {
      const token = createResetToken(user);
      const link = `${brand.url}/reset-password?token=${encodeURIComponent(token)}`;
      const transport = mailer();

      if (transport) {
        const message = resetEmail(user.firstName, link, 60);
        await transport.sendMail({
          from: `"${brand.name}" <${mailFrom()}>`,
          to: user.email,
          replyTo: brand.email,
          subject: message.subject,
          text: message.text,
          html: message.html,
        });
      } else {
        console.warn("Reset email skipped: SMTP is not configured");
      }
    }
  } catch (err) {
    // Logged, never surfaced: a failure here must not become a way of
    // telling registered addresses from unregistered ones.
    if (err instanceof StorageError) console.error(`Reset request: ${err.message}`, err.cause);
    else console.error("Reset request failed", err);
  }

  return NextResponse.json(SAME_ANSWER);
}

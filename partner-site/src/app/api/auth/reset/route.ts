import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  setPassword,
  StorageError,
  userForResetToken,
} from "@/lib/auth";
import { passwordProblem } from "@/lib/passwordRules";

/** Spend a reset link. The token dies with the password it was signed over. */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const token = body?.token ?? "";
  const password = body?.password ?? "";

  const problem = passwordProblem(password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const user = await userForResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "That link has expired or has already been used. Please ask for a new one." },
        { status: 400 }
      );
    }

    const updated = await setPassword(user.id, password);
    if (!updated) return NextResponse.json({ error: "That link is no longer valid." }, { status: 400 });

    // Sign them in, so a reset does not end at another login form.
    const store = await cookies();
    store.set(SESSION_COOKIE, createSessionToken(updated.id), sessionCookieOptions);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof StorageError) {
      console.error(`Password reset: ${err.message}`, err.cause);
      return NextResponse.json({ error: "We could not save that just now." }, { status: 500 });
    }
    throw err;
  }
}

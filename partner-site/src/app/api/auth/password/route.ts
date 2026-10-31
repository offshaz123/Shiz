import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionToken,
  SESSION_COOKIE,
  sessionCookieOptions,
  setPassword,
  StorageError,
  verifyPassword,
} from "@/lib/auth";
import { currentUser } from "@/lib/session";
import { passwordProblem } from "@/lib/passwordRules";

/** Change your own password, while signed in. Requires the current one. */
export async function POST(request: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const current = body?.currentPassword ?? "";
  const next = body?.newPassword ?? "";

  // Requiring the current password is what stops someone who walks up to an
  // unlocked laptop from taking the account away from its owner.
  if (!(await verifyPassword(current, me.password))) {
    return NextResponse.json({ error: "That is not your current password." }, { status: 401 });
  }

  const problem = passwordProblem(next);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  try {
    const updated = await setPassword(me.id, next);
    if (!updated) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

    // The old session token was signed before the change; mint a fresh one so
    // this browser stays signed in. Any reset links issued earlier are now
    // dead, because they were signed over the old hash.
    const store = await cookies();
    store.set(SESSION_COOKIE, createSessionToken(updated.id), sessionCookieOptions);

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof StorageError) {
      console.error(`Password change: ${err.message}`, err.cause);
      return NextResponse.json({ error: "We could not save that just now." }, { status: 500 });
    }
    throw err;
  }
}

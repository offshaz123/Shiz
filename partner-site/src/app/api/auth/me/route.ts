import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { findById, publicUser, readSessionToken, SESSION_COOKIE, authConfigured } from "@/lib/auth";

/**
 * Who is signed in. The greeting calls this from the browser so the pages
 * themselves can stay static — reading cookies in a page would opt the whole
 * route into dynamic rendering.
 */
export async function GET() {
  if (!authConfigured()) return NextResponse.json({ user: null });

  const store = await cookies();
  const userId = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return NextResponse.json({ user: null });

  try {
    const user = await findById(userId);
    return NextResponse.json({ user: user ? publicUser(user) : null });
  } catch (err) {
    // The greeting calls this on every home page view. A storage problem
    // should make it quietly show nothing, never break the page.
    console.error("Session lookup failed", err);
    return NextResponse.json({ user: null });
  }
}

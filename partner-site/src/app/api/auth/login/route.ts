import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authConfigured,
  createSessionToken,
  findByEmail,
  publicUser,
  SESSION_COOKIE,
  sessionCookieOptions,
  verifyPassword,
  StorageError,
} from "@/lib/auth";

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json({ error: "Accounts are not switched on yet." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  const email = body?.email ?? "";
  const password = body?.password ?? "";

  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }

  let user;
  try {
    user = await findByEmail(email);
  } catch (err) {
    if (err instanceof StorageError) {
      console.error(`Login: ${err.message}`, err.cause);
      return NextResponse.json(
        { error: "We cannot reach the account store right now. Please try again shortly." },
        { status: 500 }
      );
    }
    throw err;
  }

  // One message for "no such account" and for "wrong password", so the
  // response cannot be used to work out which addresses are registered.
  const wrong = NextResponse.json(
    { error: "Those details do not match an account." },
    { status: 401 }
  );

  if (!user || !(await verifyPassword(password, user.password))) return wrong;

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);

  return NextResponse.json({ user: publicUser(user) });
}

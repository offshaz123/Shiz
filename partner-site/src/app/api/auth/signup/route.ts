import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authConfigured,
  createSessionToken,
  createUser,
  publicUser,
  SESSION_COOKIE,
  sessionCookieOptions,
  StorageError,
} from "@/lib/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Mirrors the rules the sign-up form ticks off, so the two cannot drift. */
function passwordProblem(password: string) {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(password)) return "Password needs an uppercase letter.";
  if (!/[a-z]/.test(password)) return "Password needs a lowercase letter.";
  if (!/\d/.test(password)) return "Password needs a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Password needs a symbol.";
  return null;
}

export async function POST(request: Request) {
  if (!authConfigured()) {
    return NextResponse.json(
      { error: "Accounts are not switched on yet." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as Record<string, string> | null;
  if (!body) return NextResponse.json({ error: "Bad request." }, { status: 400 });

  const { email = "", password = "", firstName = "", lastName = "" } = body;

  if (!firstName.trim() || !lastName.trim()) {
    return NextResponse.json({ error: "Tell us your name." }, { status: 400 });
  }
  if (!EMAIL.test(email.trim())) {
    return NextResponse.json({ error: "That email does not look right." }, { status: 400 });
  }
  const problem = passwordProblem(password);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  let user;
  try {
    user = await createUser({ email, password, firstName, lastName });
  } catch (err) {
    if (err instanceof StorageError) {
      // The full path and errno go to the server log, where the operator can
      // see them; the visitor gets a message that says what is wrong without
      // publishing the filesystem layout.
      console.error(`Signup: ${err.message}`, err.cause);
      return NextResponse.json(
        {
          error:
            "We could not save your account because the server has nowhere to write it. This is our end, not yours — please try again shortly.",
        },
        { status: 500 }
      );
    }
    throw err;
  }

  // Deliberately the same wording a caller would get for a weak password
  // rather than "that email is taken": the latter tells a stranger which of
  // our addresses are real.
  if (!user) {
    return NextResponse.json(
      { error: "We could not create that account. Try logging in instead." },
      { status: 409 }
    );
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(user.id), sessionCookieOptions);

  return NextResponse.json({ user: publicUser(user) });
}

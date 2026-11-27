"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkClientLogin, endClientSession, startClientSession } from "@/lib/client-auth";
import { clearAttempts, recordFailure, tooManyAttempts } from "@/lib/login-attempts";

async function clientIp(): Promise<string> {
  const head = await headers();
  return (
    head.get("x-forwarded-for")?.split(",")[0].trim() ??
    head.get("x-real-ip") ??
    "unknown"
  );
}

export async function clientLogin(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");

  // Checked before the password is, and this order matters. Client
  // passwords are hashed with scrypt, which is deliberately slow, so
  // answering an unlimited number of guesses is also an unlimited
  // amount of work for the server — a way to flatten shared hosting
  // without guessing anything at all.
  const ip = await clientIp();
  if (await tooManyAttempts(ip, "client")) redirect("/portal?error=slow");

  const account = await checkClientLogin(slug, password);
  // Deliberately one message for every failure. Saying "no such account"
  // would tell a stranger which client names are real.
  if (!account) {
    await recordFailure(ip, "client");
    redirect("/portal?error=1");
  }

  await clearAttempts(ip, "client");
  await startClientSession(account.id);
  redirect("/portal");
}

export async function clientLogout() {
  await endClientSession();
  redirect("/portal");
}

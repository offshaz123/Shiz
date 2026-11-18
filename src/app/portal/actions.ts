"use server";

import { redirect } from "next/navigation";
import { checkClientLogin, endClientSession, startClientSession } from "@/lib/client-auth";

export async function clientLogin(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const password = String(formData.get("password") ?? "");

  const account = await checkClientLogin(slug, password);
  // Deliberately one message for every failure. Saying "no such account"
  // would tell a stranger which client names are real.
  if (!account) redirect("/portal?error=1");

  await startClientSession(account.id);
  redirect("/portal");
}

export async function clientLogout() {
  await endClientSession();
  redirect("/portal");
}

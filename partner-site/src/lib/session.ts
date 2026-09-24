import { cookies } from "next/headers";
import { findById, readSessionToken, SESSION_COOKIE, type User } from "@/lib/auth";

/**
 * The signed-in user, or null. Kept apart from lib/auth so that file stays
 * free of framework imports and can be reasoned about (and tested) on its own.
 */
export async function currentUser(): Promise<User | null> {
  const store = await cookies();
  const userId = readSessionToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  return findById(userId);
}

"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  checkPassword,
  clearAttempts,
  endSession,
  recordFailure,
  requireAdmin,
  startSession,
  tooManyAttempts,
} from "@/lib/admin-auth";
import { withDb } from "@/lib/db";
import { deleteReview, setReviewStatus, type ReviewStatus } from "@/lib/reviews";

/**
 * Every action here verifies the session first. Server actions are reachable
 * by direct POST, not only through the page that renders the form, so the
 * login screen in front of the dashboard protects the view and nothing else.
 */

export type LoginState = { error?: string };

async function clientIp(): Promise<string> {
  const head = await headers();
  return (
    head.get("x-forwarded-for")?.split(",")[0].trim() ??
    head.get("x-real-ip") ??
    "unknown"
  );
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const ip = await clientIp();
  if (tooManyAttempts(ip)) {
    return { error: "Too many attempts. Wait fifteen minutes and try again." };
  }

  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    recordFailure(ip);
    // Deliberately the same message whether the password was wrong or
    // ADMIN_PASSWORD was never set — a login screen should not report on its
    // own configuration to whoever is standing in front of it.
    return { error: "That password isn't right." };
  }

  clearAttempts(ip);
  await startSession();
  revalidatePath("/admin");
  return {};
}

export async function logout(): Promise<void> {
  await endSession();
  revalidatePath("/admin");
}

export async function setContacted(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const contacted = formData.get("contacted") === "1";
  if (!Number.isInteger(id) || id <= 0) return;

  await withDb(async (db) => {
    await db.execute("UPDATE scan_leads SET contacted = ? WHERE id = ?", [
      contacted ? 1 : 0,
      id,
    ]);
  });

  revalidatePath("/admin");
}

export async function saveNote(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const note = String(formData.get("note") ?? "").slice(0, 2000);
  if (!Number.isInteger(id) || id <= 0) return;

  await withDb(async (db) => {
    await db.execute("UPDATE scan_leads SET notes = ? WHERE id = ?", [
      note || null,
      id,
    ]);
  });

  revalidatePath("/admin");
}

export async function moderateReview(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  if (!Number.isInteger(id) || id <= 0) return;
  if (!["pending", "approved", "hidden"].includes(status)) return;

  await setReviewStatus(id, status as ReviewStatus);

  // The homepage caches for five minutes, so without this an approved review
  // would sit invisible for up to that long and look like the button failed.
  revalidatePath("/admin");
  revalidatePath("/");
}

export async function removeReview(formData: FormData): Promise<void> {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  await deleteReview(id);
  revalidatePath("/admin");
  revalidatePath("/");
}

"use server";

import { revalidatePath } from "next/cache";
import { actor, requireOwner } from "@/lib/admin-auth";
import { grantablePages, type PageKey } from "@/lib/admin-pages";
import {
  addStaff,
  getStaff,
  logAction,
  setStaffActive,
  setStaffPages,
  setStaffPassword,
} from "@/lib/staff";

/**
 * Everything on the team screen.
 *
 * Every action calls requireOwner first. Server actions are reachable by
 * direct POST whether or not the button was drawn, so a member of staff who
 * cannot see this page could otherwise still grant themselves the clients
 * page by posting to the action behind it.
 */

export type StaffFormState = { error?: string; ok?: string };

export async function createStaff(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  await requireOwner();

  const name = String(formData.get("name") ?? "");
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");

  const result = await addStaff(name, username, password);
  if (!result.ok) return { error: result.reason };

  await logAction(await actor(), "added-staff", name.trim());
  revalidatePath("/admin/staff");
  return { ok: `${name.trim()} can sign in now.` };
}

export async function updatePages(formData: FormData): Promise<void> {
  await requireOwner();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;

  // Read from the form rather than toggling one key, so what is saved is
  // exactly what is on the screen even if two tabs are open.
  const pages = grantablePages()
    .map((p) => p.key)
    .filter((key) => formData.get(`page-${key}`) === "on") as PageKey[];

  const before = await getStaff(id);
  await setStaffPages(id, pages);
  await logAction(
    await actor(),
    "changed-access",
    before?.name ?? `staff ${id}`,
    pages.length ? `can now see: ${pages.join(", ")}` : "can see nothing",
  );
  revalidatePath("/admin/staff");
}

export async function toggleActive(formData: FormData): Promise<void> {
  await requireOwner();

  const id = Number(formData.get("id"));
  const active = formData.get("active") === "on";
  if (!Number.isInteger(id) || id <= 0) return;

  const them = await getStaff(id);
  await setStaffActive(id, active);
  await logAction(
    await actor(),
    active ? "enabled-staff" : "disabled-staff",
    them?.name ?? `staff ${id}`,
  );
  revalidatePath("/admin/staff");
}

export async function resetPassword(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  await requireOwner();

  const id = Number(formData.get("id"));
  const password = String(formData.get("password") ?? "");
  if (!Number.isInteger(id) || id <= 0) return { error: "Unknown person." };

  const ok = await setStaffPassword(id, password);
  if (!ok) return { error: "Passwords need to be at least ten characters." };

  const them = await getStaff(id);
  await logAction(await actor(), "reset-staff-password", them?.name ?? `staff ${id}`);
  revalidatePath("/admin/staff");
  return { ok: "Password changed. Tell them what it is — it is not shown anywhere." };
}

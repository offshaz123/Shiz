"use server";

import { revalidatePath } from "next/cache";
import { actor, requireOwner } from "@/lib/admin-auth";
import { grantablePages, type PageKey } from "@/lib/admin-pages";
import { REGIONS, type Region } from "@/lib/regions";
import { setSetting } from "@/lib/settings";
import {
  addStaff,
  getStaff,
  logAction,
  setStaffActive,
  setStaffPages,
  setStaffExtension,
  setStaffPassword,
  setStaffRegions,
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

  // Which countries' lists, saved from the same form. Two switches that
  // have to be pressed separately is two ways to leave somebody half set
  // up, and half set up here means an empty call list and no clue why.
  const regions = REGIONS.filter((r) => formData.get(`region-${r}`) === "on") as Region[];

  const before = await getStaff(id);
  await setStaffPages(id, pages);
  await setStaffRegions(id, regions);
  // Saved from the same form as the rest. The extension is what links a
  // call to a person, and a half-set-up account means calls that log
  // against nobody.
  await setStaffExtension(id, String(formData.get("extension") ?? ""));
  await logAction(
    await actor(),
    "changed-access",
    before?.name ?? `staff ${id}`,
    [
      pages.length ? `can see: ${pages.join(", ")}` : "can see no pages",
      `lists: ${(regions.length ? regions : REGIONS).join(", ")}`,
    ].join("; "),
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

/**
 * The owner's own phone extension.
 *
 * This used to be an environment variable, which meant setting it needed
 * the hosting panel while everybody else typed theirs into a box on this
 * page — asked about the first time it came up, and fairly. The variable
 * still works underneath; this just wins over it.
 */
export async function saveOwnerExtension(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  await requireOwner();

  const raw = String(formData.get("extension") ?? "").trim();
  // Digits only. An extension with a space or a stray letter in it fails
  // in the phone system with no message, which is the sort of thing that
  // gets put down to the feature not working.
  if (raw && !/^\d{1,6}$/.test(raw)) {
    return { error: "An extension is just the digits, like 100." };
  }

  await setSetting("owner_extension", raw);
  await logAction(await actor(), "set-own-extension", raw || "none");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/prospects");
  return {
    ok: raw ? `Saved. Calls you make go out as extension ${raw}.` : "Cleared.",
  };
}

/**
 * The phone system's account number.
 *
 * Set once, used by everybody: an extension does not log in as "101",
 * it logs in as the account number and the extension joined with a
 * hyphen. Without this the phone setup page can tell somebody their
 * extension and then has to send them to ask for the other half, which
 * rather defeats a page that exists so nobody has to ask.
 */
export async function savePbxId(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  await requireOwner();

  const raw = String(formData.get("pbxId") ?? "").trim();
  if (raw && !/^\d{3,10}$/.test(raw)) {
    return { error: "That is just the digits from the phone system, like 123456." };
  }

  await setSetting("zadarma_pbx_id", raw);
  await logAction(await actor(), "set-pbx-id", raw || "none");
  revalidatePath("/admin/staff");
  revalidatePath("/admin/phone");
  return { ok: raw ? `Saved. Everybody logs in as ${raw}-their extension.` : "Cleared." };
}

/**
 * The number each country's businesses see ringing them.
 *
 * Stored rather than hard-coded because the American one did not exist
 * when the British one was bought, and the next one will not exist
 * today either.
 */
export async function saveNumbers(
  _prev: StaffFormState,
  formData: FormData,
): Promise<StaffFormState> {
  await requireOwner();

  const clean = (name: string) => String(formData.get(name) ?? "").replace(/[\s()-]/g, "").trim();
  const uk = clean("ukNumber");
  const us = clean("usNumber");

  // Loose on purpose: it has to be a plain international number, and
  // beyond that the phone system is a better judge than a regex.
  const looksWrong = [uk, us].some((n) => n && !/^\+?\d{7,15}$/.test(n));
  if (looksWrong) {
    return { error: "Put the full number in, like +442045773152." };
  }

  await setSetting("uk_number", uk);
  await setSetting("us_number", us);
  await logAction(await actor(), "set-caller-id", [uk, us].filter(Boolean).join(" / ") || "none");
  revalidatePath("/admin/staff");
  return {
    ok:
      uk || us
        ? "Saved. Businesses see the number for their own country."
        : "Cleared. Calls go out on whatever the extension is set to.",
  };
}

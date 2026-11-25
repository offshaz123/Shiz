"use server";

import { revalidatePath } from "next/cache";
import { actor, requireOwner } from "@/lib/admin-auth";
import { setSetting } from "@/lib/settings";
import { logAction } from "@/lib/staff";
import type { StaffFormState } from "../staff/actions";

/**
 * The settings that belong to the company rather than to a person.
 *
 * They were on the Team page, inside the box where the owner sets his own
 * extension — so the phone system's account number, which is the same for
 * everybody, and the two numbers businesses see when we ring them, which
 * are nothing to do with any one person, both lived under a heading that
 * said "Your own extension". Things ended up wherever there was room,
 * which is how a settings screen becomes a place nobody can find anything.
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
  revalidatePath("/admin/settings");
  revalidatePath("/admin/phone");
  return { ok: raw ? `Saved. Everybody logs in as ${raw}-their extension.` : "Cleared." };
}

/**
 * The number each country's businesses see ringing them.
 *
 * Stored rather than hard-coded because the American one did not exist
 * when the British one was bought, and the next one will not exist today
 * either.
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
  revalidatePath("/admin/settings");
  revalidatePath("/admin/phone");
  return {
    ok:
      uk || us
        ? "Saved. Businesses see the number for their own country."
        : "Cleared. Calls go out on whatever the extension is set to.",
  };
}

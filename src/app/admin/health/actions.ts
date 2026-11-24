"use server";

import { revalidatePath } from "next/cache";
import { actor, requireOwner } from "@/lib/admin-auth";
import { connectWebhook, webhookUrl } from "@/lib/zadarma";
import { logAction } from "@/lib/staff";

export type PhoneState = { error?: string; ok?: string };

/**
 * Points the phone system at us.
 *
 * Owner only. It changes a setting on an account that spends money, and
 * it is reachable by direct POST whether or not the button was drawn.
 */
export async function connectPhoneSystem(): Promise<PhoneState> {
  await requireOwner();

  const url = webhookUrl();
  const result = await connectWebhook(url);
  if (!result.ok) return { error: result.reason ?? "It would not connect." };

  await logAction(await actor(), "connected-phone", url);
  revalidatePath("/admin/health");
  return { ok: "Connected. Calls will log themselves from now on." };
}

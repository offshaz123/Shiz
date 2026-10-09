"use client";

import { useState } from "react";
import type { User } from "@/lib/auth";

export function AccountDetailsForm({ user }: { user: Omit<User, "id" | "created_at"> }) {
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState("");

  const input = (name: keyof typeof user, label: string, type = "text", auto?: string, optional = false) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label}
        {optional && <span className="font-normal text-muted"> (optional)</span>}
      </span>
      <input className="field" name={name} type={type} defaultValue={user[name]} autoComplete={auto} required={!optional} />
    </label>
  );

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setState("saving");
        setError("");
        const res = await fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          setError(json.error ?? "Something went wrong. Please try again.");
          setState("idle");
          return;
        }
        setState("saved");
        (e.target as HTMLFormElement).querySelectorAll<HTMLInputElement>('input[type="password"]').forEach((i) => (i.value = ""));
      }}
      onChange={() => state === "saved" && setState("idle")}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">{input("name", "Full name", "text", "name")}</div>
        {input("email", "Email", "email", "email")}
        {input("phone", "Mobile number", "tel", "tel", true)}
      </div>

      <fieldset>
        <legend className="mb-3 font-display text-xl font-bold">Delivery address</legend>
        <p className="-mt-2 mb-3 text-sm text-muted">Saved here, it&apos;s filled in for you at checkout.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">{input("address1", "Address line 1", "text", "address-line1", true)}</div>
          <div className="sm:col-span-2">{input("address2", "Address line 2", "text", "address-line2", true)}</div>
          {input("town", "Town / City", "text", "address-level2", true)}
          {input("postcode", "Postcode", "text", "postal-code", true)}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 font-display text-xl font-bold">Change password</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Current password</span>
            <input className="field" name="currentPassword" type="password" autoComplete="current-password" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">New password</span>
            <input className="field" name="newPassword" type="password" autoComplete="new-password" minLength={8} />
          </label>
        </div>
        <p className="mt-2 text-xs text-muted">Leave blank to keep your current password.</p>
      </fieldset>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <div className="flex items-center gap-4">
        <button type="submit" className="btn btn-gold rounded-lg" disabled={state === "saving"}>
          {state === "saving" ? "Saving…" : "Save changes"}
        </button>
        {state === "saved" && (
          <span role="status" className="font-semibold text-[#1f7a3d]">
            ✓ Saved
          </span>
        )}
      </div>
    </form>
  );
}

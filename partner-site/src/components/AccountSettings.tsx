"use client";

import { useState } from "react";
import type { PublicUser } from "@/lib/auth";
import { passwordRules } from "@/lib/passwordRules";

const field =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted/70 focus:border-accent focus:shadow-[var(--ring)]";
const label = "mb-1.5 block text-sm font-medium";

function Note({ tone, children }: { tone: "ok" | "bad"; children: React.ReactNode }) {
  return (
    <p
      role="status"
      className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${
        tone === "ok"
          ? "border-[#0e9f6e]/30 bg-[#0e9f6e]/10 text-[#0b7a54]"
          : "border-[#e0537a]/30 bg-[#e0537a]/10 text-[#b03357]"
      }`}
    >
      {children}
    </p>
  );
}

/**
 * Account settings: who you are, how to reach you, and your password.
 *
 * The email is shown but not editable. Changing it is a change of identity,
 * not a detail — it would have to be verified at the new address first, or
 * an account could be walked over to somebody else's inbox.
 */
export function AccountSettings({ user }: { user: PublicUser }) {
  const [profileState, setProfileState] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [passwordState, setPasswordState] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSavingProfile(true);
    setProfileState(null);
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          company: form.get("company"),
          phone: form.get("phone"),
          address: {
            line1: form.get("line1"),
            line2: form.get("line2"),
            city: form.get("city"),
            postcode: form.get("postcode"),
            country: form.get("country"),
          },
        }),
      });
      const data = await response.json().catch(() => null);
      setProfileState(
        response.ok
          ? { tone: "ok", text: "Saved." }
          : { tone: "bad", text: data?.error ?? "We could not save that." }
      );
    } catch {
      setProfileState({ tone: "bad", text: "We could not reach the server." });
    }
    setSavingProfile(false);
  }

  async function changePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get("newPassword") !== data.get("confirmPassword")) {
      setPasswordState({ tone: "bad", text: "The two new passwords do not match." });
      return;
    }

    setSavingPassword(true);
    setPasswordState(null);
    try {
      const response = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.get("currentPassword"),
          newPassword: data.get("newPassword"),
        }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok) {
        setPasswordState({ tone: "ok", text: "Password changed." });
        form.reset();
        setNewPassword("");
      } else {
        setPasswordState({ tone: "bad", text: body?.error ?? "We could not change it." });
      }
    } catch {
      setPasswordState({ tone: "bad", text: "We could not reach the server." });
    }
    setSavingPassword(false);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {/* Details */}
      <form onSubmit={saveProfile} className="card p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Your details</h2>
        <p className="mt-1.5 text-sm text-muted">
          Signed in as <span className="font-medium text-foreground">{user.email}</span>
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="firstName">First name</label>
            <input id="firstName" name="firstName" defaultValue={user.firstName} required className={field} />
          </div>
          <div>
            <label className={label} htmlFor="lastName">Last name</label>
            <input id="lastName" name="lastName" defaultValue={user.lastName} required className={field} />
          </div>
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="company">Company</label>
          <input id="company" name="company" defaultValue={user.company ?? ""} className={field} />
        </div>

        <div className="mt-4">
          <label className={label} htmlFor="phone">Phone</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={user.phone ?? ""} className={field} />
        </div>

        <fieldset className="mt-6 border-t border-border pt-5">
          <legend className="sr-only">Address</legend>
          <p className="mb-4 text-sm font-semibold">Address</p>
          <div className="grid gap-4">
            <input name="line1" placeholder="Address line 1" defaultValue={user.address?.line1 ?? ""} className={field} aria-label="Address line 1" />
            <input name="line2" placeholder="Address line 2 (optional)" defaultValue={user.address?.line2 ?? ""} className={field} aria-label="Address line 2" />
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="city" placeholder="Town or city" defaultValue={user.address?.city ?? ""} className={field} aria-label="Town or city" />
              <input name="postcode" placeholder="Postcode" defaultValue={user.address?.postcode ?? ""} className={field} aria-label="Postcode" />
            </div>
            <input name="country" placeholder="Country" defaultValue={user.address?.country ?? "United Kingdom"} className={field} aria-label="Country" />
          </div>
        </fieldset>

        {profileState && <Note tone={profileState.tone}>{profileState.text}</Note>}

        <button type="submit" disabled={savingProfile} className="btn btn-primary mt-6 w-full disabled:opacity-60">
          {savingProfile ? "Saving…" : "Save details"}
        </button>
      </form>

      {/* Password */}
      <form onSubmit={changePassword} className="card p-6 sm:p-8">
        <h2 className="font-display text-xl font-semibold">Change your password</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          You need your current password. That is what stops anyone who finds your
          screen unlocked from taking the account off you.
        </p>

        <div className="mt-6 grid gap-4">
          <div>
            <label className={label} htmlFor="currentPassword">Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required className={field} />
          </div>
          <div>
            <label className={label} htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={field}
            />
            <ul className="mt-3 grid gap-1.5 sm:grid-cols-2">
              {passwordRules.map((rule) => {
                const met = rule.test(newPassword);
                return (
                  <li key={rule.label} className={`text-xs ${met ? "text-[#0e9f6e]" : "text-muted"}`}>
                    {met ? "✓" : "○"} {rule.label}
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <label className={label} htmlFor="confirmPassword">Confirm new password</label>
            <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={field} />
          </div>
        </div>

        {passwordState && <Note tone={passwordState.tone}>{passwordState.text}</Note>}

        <button type="submit" disabled={savingPassword} className="btn btn-primary mt-6 w-full disabled:opacity-60">
          {savingPassword ? "Changing…" : "Change password"}
        </button>
      </form>
    </div>
  );
}

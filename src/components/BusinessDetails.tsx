"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { BusinessProfile } from "@/lib/invoices";
import { MAX_LOGO_BYTES } from "@/lib/client-logo-limits";

/**
 * Their business, in boxes, so nobody has to get the formatting right.
 *
 * One box per thing rather than one box for the address, because a single
 * box means every client lays theirs out differently and the invoice shows
 * whatever they did. Separate boxes mean the document decides: a postcode
 * typed "m124wd" is stored and printed as "M12 4WD", a VAT number typed
 * "123 456 789" comes out "GB123456789", and a website pasted with
 * https://www. on the front prints without it.
 *
 * What is never corrected is the business name. "McGrath" and "MOT4U" are
 * not mistakes, and a tidy-up clever enough to title-case a name is a
 * tidy-up that will get somebody's name wrong.
 *
 * Boxes save when you click away. There are a dozen of them and somebody
 * filling this in on a phone between jobs should not lose the lot because
 * they closed the tab on the last one.
 */

const FIELD =
  "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-pink";

/**
 * Shrinks a picture in the browser before it is sent.
 *
 * The file is usually straight off a phone camera roll, which is several
 * megabytes, and what is wanted is a logo a few hundred pixels across. The
 * canvas does it here so the upload is quick on a phone signal, and the
 * server checks the size again anyway.
 *
 * PNG out, so a logo with a transparent background keeps it. JPEG would
 * fill the transparency with black, which on an invoice is a black box
 * where their logo should be.
 */
async function shrink(file: File, max = 600): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("not an image"));
      img.src = url;
    });

    const scale = Math.min(1, max / Math.max(image.width, image.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));

    const context = canvas.getContext("2d");
    if (!context) throw new Error("no canvas");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("could not convert"))),
        "image/png",
      );
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <p className="mt-0.5 text-xs leading-relaxed text-muted">{note}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/**
 * One labelled box that saves when you click away.
 *
 * Declared out here rather than inside the form. A component defined
 * during a render is a new type on every render, so React tears the input
 * down and builds it again — and an uncontrolled input rebuilt mid-edit
 * loses whatever was half-typed in it.
 */
function Box({
  label,
  value,
  onSave,
  note,
  placeholder,
  rows,
  className = "",
}: {
  label: string;
  value: string;
  onSave: (next: string) => void;
  note?: string;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-muted">{label}</span>
      {rows ? (
        <textarea
          defaultValue={value}
          rows={rows}
          placeholder={placeholder}
          onBlur={(e) => onSave(e.target.value)}
          className={`${FIELD} leading-relaxed`}
        />
      ) : (
        <input
          defaultValue={value}
          placeholder={placeholder}
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          onBlur={(e) => onSave(e.target.value)}
          className={FIELD}
        />
      )}
      {note && <span className="text-[11px] leading-relaxed text-muted">{note}</span>}
    </label>
  );
}

export function BusinessDetails({ profile }: { profile: BusinessProfile }) {
  const router = useRouter();
  // The bank block is the one thing here with a Save button. The boxes
  // belong together — a sort code saved without its account number is
  // half a payment instruction — and the button is the moment to check
  // the numbers before they go on a document asking somebody for money.
  const [bank, setBank] = useState({
    bankAccountName: profile.bankAccountName,
    bankSortCode: profile.bankSortCode,
    bankAccountNumber: profile.bankAccountNumber,
  });
  const [savingBank, setSavingBank] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [uploading, setUploading] = useState(false);

  async function save(field: string, value: string, was: string) {
    if (value === was) return;
    setError("");
    try {
      const res = await fetch("/api/portal/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaved("Saved.");
      // Refreshed so the tidied version comes back into the box. What they
      // see afterwards has to be what their customers will see.
      router.refresh();
    } catch {
      setError("That did not save. Try again in a moment.");
    }
  }

  async function saveBank() {
    setSavingBank(true);
    setError("");
    setSaved("");
    try {
      const res = await fetch("/api/portal/invoices", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bank),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaved("Bank details saved.");
      router.refresh();
    } catch {
      setError("Your bank details did not save. Try again in a moment.");
    } finally {
      setSavingBank(false);
    }
  }

  async function upload(file: File) {
    setUploading(true);
    setError("");
    setSaved("");
    try {
      const small = await shrink(file);
      if (small.size > MAX_LOGO_BYTES) throw new Error("too_big");

      const body = new FormData();
      body.append("logo", small, "logo.png");
      const res = await fetch("/api/portal/logo", { method: "POST", body });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? String(res.status));

      setSaved("Logo saved.");
      router.refresh();
    } catch (err) {
      setError(
        String(err).includes("not an image")
          ? "That file is not a picture. A JPG or PNG works."
          : String(err).includes("too_big")
            ? "That picture is too big even after shrinking. Try a smaller one."
            : "The logo did not save. Try again in a moment.",
      );
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function removeLogo() {
    setError("");
    try {
      const res = await fetch("/api/portal/logo", { method: "DELETE" });
      if (!res.ok) throw new Error(String(res.status));
      setSaved("Logo removed.");
      router.refresh();
    } catch {
      setError("That did not work. Try again in a moment.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {(error || saved) && (
        <p
          className={`rounded-xl border px-4 py-2.5 text-xs font-medium ${
            error
              ? "border-red-500/40 text-red-500"
              : "border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
          }`}
        >
          {error || saved}
        </p>
      )}

      <Section
        title="Your logo"
        note="Goes at the top of every invoice you send. A photo from your phone or a file from your computer — it is shrunk to the right size for you."
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl border border-dashed border-border bg-background">
            {profile.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logoUrl}
                alt="Your logo"
                className="max-h-20 max-w-28 object-contain"
              />
            ) : (
              <span className="text-[11px] text-muted">No logo yet</span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <input
              ref={fileInput}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
              }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInput.current?.click()}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-50"
            >
              {uploading ? "Saving…" : profile.logoUrl ? "Change it" : "Choose a picture"}
            </button>
            {profile.logoUrl && (
              <button
                type="button"
                onClick={removeLogo}
                className="rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted hover:text-foreground"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Your business"
        note="How you want to appear on an invoice. We have you down as a business name already — fill the first box in only if the invoice should say something different."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Box
            value={profile.invoiceName}
            onSave={(next) => save("invoiceName", next, profile.invoiceName)}
            label="Name on your invoices"
            placeholder={profile.accountName}
            note={`Left blank, invoices say “${profile.accountName}”.`}
            className="sm:col-span-2"
          />
          <Box value={profile.email} onSave={(next) => save("email", next, profile.email)} label="Email" placeholder="you@yourbusiness.co.uk" />
          <Box value={profile.phone} onSave={(next) => save("phone", next, profile.phone)} label="Phone" placeholder="0161 123 4567" />
          <Box
            value={profile.website}
            onSave={(next) => save("website", next, profile.website)}
            label="Website"
            placeholder="yourbusiness.co.uk"
            note="Paste it however you like — it prints tidily."
          />
          <Box
            value={profile.vatNumber}
            onSave={(next) => save("vatNumber", next, profile.vatNumber)}
            label="VAT number"
            placeholder="123456789"
            note="Blank if you are not registered. Nothing about VAT appears on an invoice without it. The GB goes on by itself."
          />
        </div>
      </Section>

      <Section
        title="Your address"
        note="One line each. It is laid out properly on the invoice, and blank boxes are left out rather than leaving a gap."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Box
            value={profile.line1}
            onSave={(next) => save("line1", next, profile.line1)}
            label="Street address"
            placeholder="Unit 4, Barton Works"
            className="sm:col-span-2"
          />
          <Box
            value={profile.line2}
            onSave={(next) => save("line2", next, profile.line2)}
            label="Second line (if you have one)"
            placeholder="Stockport Road"
            className="sm:col-span-2"
          />
          <Box value={profile.city} onSave={(next) => save("city", next, profile.city)} label="Town or city" placeholder="Manchester" />
          <Box
            value={profile.postcode}
            onSave={(next) => save("postcode", next, profile.postcode)}
            label="Postcode"
            placeholder="M12 4WD"
            note="Capitals and spaces sort themselves out."
          />
          <Box
            value={profile.country}
            onSave={(next) => save("country", next, profile.country)}
            label="Country (only if you need it on there)"
            placeholder="United Kingdom"
            className="sm:col-span-2"
          />
        </div>
      </Section>

      <Section
        title="How your customers pay you"
        note="Printed at the bottom of every invoice, each line labelled, so your customer can copy it straight into their banking app."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="text-xs font-medium text-muted">Account name</span>
            <input
              value={bank.bankAccountName}
              onChange={(e) => setBank({ ...bank, bankAccountName: e.target.value })}
              placeholder="The name on your bank account"
              className={FIELD}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Sort code</span>
            <input
              value={bank.bankSortCode}
              onChange={(e) => setBank({ ...bank, bankSortCode: e.target.value })}
              inputMode="numeric"
              placeholder="12-34-56"
              className={FIELD}
            />
            <span className="text-[11px] text-muted">
              Type the six digits — the dashes go in by themselves.
            </span>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted">Account number</span>
            <input
              value={bank.bankAccountNumber}
              onChange={(e) => setBank({ ...bank, bankAccountNumber: e.target.value })}
              inputMode="numeric"
              placeholder="12345678"
              className={FIELD}
            />
          </label>
        </div>

        <button
          type="button"
          onClick={saveBank}
          disabled={savingBank}
          className="brand-gradient-bg mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {savingBank ? "Saving…" : "Save bank details"}
        </button>

        <div className="mt-5 border-t border-border pt-4">
          <Box
            value={profile.paymentDetails}
            onSave={(next) => save("paymentDetails", next, profile.paymentDetails)}
            label="Anything else about paying you"
            rows={3}
            note="Goes under the bank details. A payment link, your terms, or that you take card on the day. Leave it blank if the bank details are enough. This box saves when you click away."
            placeholder={"Reference: the invoice number\nCard taken on the day if you prefer."}
          />
        </div>
      </Section>
    </div>
  );
}

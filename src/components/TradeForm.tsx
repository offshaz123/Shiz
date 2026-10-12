"use client";

import { useState } from "react";
import { site } from "@/lib/site";

const businessTypes = ["Car dealership", "Garage / MOT centre", "Body shop", "Detailer / wrap shop", "Fleet / lease company", "Other"];
const volumes = ["1–10 a month", "10–50 a month", "50–100 a month", "100+ a month"];

// Builds a trade enquiry and opens it in WhatsApp, ready to send.
export function TradeForm() {
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4 rounded-3xl border border-line bg-white p-5 shadow-xl shadow-black/5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        if (!f.business?.trim() || !f.name?.trim() || !f.phone?.trim()) {
          setError("Please fill in your business name, your name and phone number.");
          return;
        }
        const text = [
          "Hi PlatedUp, I'm interested in a TRADE account.",
          "",
          `Business: ${f.business.trim()}`,
          `Type of business: ${f.type}`,
          `Contact name: ${f.name.trim()}`,
          `Phone: ${f.phone.trim()}`,
          f.email?.trim() ? `Email: ${f.email.trim()}` : "",
          f.postcode?.trim() ? `Postcode: ${f.postcode.trim().toUpperCase()}` : "",
          `Plates needed: ${f.volume}`,
          f.message?.trim() ? `\nMessage: ${f.message.trim()}` : "",
        ]
          .filter((l) => l !== "")
          .join("\n");
        window.location.href = `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
      }}
    >
      <h2 className="font-display text-2xl font-bold">Trade enquiry</h2>
      <p className="-mt-2 text-sm text-muted">Fill this in and press the button. WhatsApp opens with your details ready to send.</p>
      <label className="block">
        <span className="text-sm font-semibold">Business name *</span>
        <input name="business" className="field mt-1" maxLength={120} autoComplete="organization" required />
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Type of business</span>
        <select name="type" className="field mt-1" defaultValue={businessTypes[0]}>
          {businessTypes.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-semibold">Your name *</span>
          <input name="name" className="field mt-1" maxLength={100} autoComplete="name" required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Phone *</span>
          <input name="phone" type="tel" className="field mt-1" maxLength={30} autoComplete="tel" required />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Email</span>
          <input name="email" type="email" className="field mt-1" maxLength={120} autoComplete="email" />
        </label>
        <label className="block">
          <span className="text-sm font-semibold">Postcode</span>
          <input name="postcode" className="field mt-1 uppercase" maxLength={10} autoComplete="postal-code" />
        </label>
      </div>
      <label className="block">
        <span className="text-sm font-semibold">Roughly how many plates do you need?</span>
        <select name="volume" className="field mt-1" defaultValue={volumes[1]}>
          {volumes.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="text-sm font-semibold">Anything else?</span>
        <textarea name="message" rows={3} maxLength={600} className="field mt-1" placeholder="e.g. mostly 4D plates for used car sales" />
      </label>
      {error && (
        <p role="alert" className="text-sm font-medium text-red-700">
          {error}
        </p>
      )}
      <button type="submit" className="btn w-full bg-[#25D366] text-white hover:brightness-95">
        Send enquiry on WhatsApp
      </button>
    </form>
  );
}

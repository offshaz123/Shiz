"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SHOW_MAX, cleanShowText, formatReg, isValidReg } from "@/lib/plates";

export function RegForm({ buttonLabel = "Build Now", inline = false }: { buttonLabel?: string; inline?: boolean }) {
  const router = useRouter();
  const [reg, setReg] = useState("");
  const [error, setError] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // Anything goes here: a real registration or show-plate text. The
        // builder works out which and lets the customer choose.
        const text = cleanShowText(reg).trim();
        if (!text) {
          setError("Please type your registration or the text you want on your plate");
          return;
        }
        router.push(`/design?reg=${encodeURIComponent(text)}`);
      }}
    >
      <label htmlFor={inline ? "hero-reg" : "reg-start"} className={`mb-2 block text-sm font-semibold ${inline ? "text-left" : ""}`}>
        Enter Your Registration
      </label>
      <div className={inline ? "flex flex-col gap-3 sm:flex-row" : "space-y-3"}>
        <input
          id={inline ? "hero-reg" : "reg-start"}
          className="field h-14 flex-1 bg-[var(--plate-rear)] text-center font-[family-name:var(--font-plate)] text-3xl font-semibold uppercase tracking-widest placeholder:text-black/35"
          value={reg}
          onChange={(e) => {
            setReg(e.target.value.toUpperCase());
            setError("");
          }}
          onBlur={() => reg && isValidReg(reg) && setReg(formatReg(reg))}
          placeholder="AB12 CDE"
          maxLength={SHOW_MAX}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={!!error}
          aria-describedby={error ? "reg-error" : undefined}
        />
        <button type="submit" className={`btn btn-gold h-14 ${inline ? "rounded-lg" : "w-full"}`}>
          {buttonLabel} <span aria-hidden>→</span>
        </button>
      </div>
      {error && (
        <p id="reg-error" className="mt-2 rounded-lg bg-white px-3 py-2 text-left text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </form>
  );
}

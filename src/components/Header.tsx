"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { nav, whatsappHref } from "@/lib/site";
import { useCart } from "@/lib/cart";

function BasketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
      <circle cx="10" cy="20.5" r="1.3" />
      <circle cx="17" cy="20.5" r="1.3" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-20 items-center justify-between gap-3">
          <Link href="/" onClick={() => setOpen(false)} className="shrink-0" aria-label="PlatedUp home">
            <Logo className="h-12 w-auto sm:h-14" />
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <a
              href={whatsappHref}
              className="hidden items-center gap-2 font-semibold text-[#128c4a] hover:underline md:flex"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
                <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z" />
              </svg>
              Chat on WhatsApp
            </a>
            <Link
              href="/upload-documents"
              className="gold-bg hidden items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold sm:inline-flex"
            >
              <UploadIcon /> Upload Documents
            </Link>
            <Link
              href="/basket"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg border border-line hover:bg-surface"
              aria-label={`Basket, ${count} item${count === 1 ? "" : "s"}`}
            >
              <BasketIcon />
              {count > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-xs font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-line lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((o) => !o)}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
              </svg>
            </button>
          </div>
        </div>

        <nav className="mb-3 hidden rounded-xl bg-surface-2/70 p-1.5 lg:block" aria-label="Main">
          <ul className="flex flex-wrap gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className={`block rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors ${
                    isActive(n.href) ? "gold-bg shadow-sm" : "hover:bg-white"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {open && (
        <nav
          id="mobile-menu"
          className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-line bg-white lg:hidden"
          aria-label="Mobile"
        >
          <ul className="mx-auto max-w-7xl px-4 py-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-line py-4 text-lg font-semibold ${isActive(n.href) ? "text-gold" : ""}`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
            <li className="grid gap-3 py-4">
              <Link href="/upload-documents" onClick={() => setOpen(false)} className="btn btn-gold w-full">
                Upload Documents
              </Link>
              <a href={whatsappHref} className="btn btn-white w-full">
                Chat on WhatsApp
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}

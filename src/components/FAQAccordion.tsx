"use client";

import { useState } from "react";
import type { Faq } from "@/content/faqs";

export function FAQAccordion({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((faq, index) => {
        const open = openIndex === index;
        return (
          <div key={faq.question} className="rounded-2xl border border-border bg-background overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={open}
            >
              <span className="text-base font-semibold text-foreground">{faq.question}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className={`h-5 w-5 shrink-0 text-brand-pink transition-transform ${open ? "rotate-180" : ""}`}
              >
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {open && <p className="px-6 pb-5 text-sm leading-relaxed text-muted">{faq.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}

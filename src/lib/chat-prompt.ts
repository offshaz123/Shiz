import { serviceCategories } from "@/content/services";
import { faqs } from "@/content/faqs";
import { siteConfig, fullAddress } from "@/lib/site-config";

function describeCategory(category: (typeof serviceCategories)[number]): string {
  const lines: string[] = [`${category.title} — ${category.shortDescription}`];

  if (category.whatIncluded?.length) {
    for (const item of category.whatIncluded) {
      lines.push(`  - ${item.name}: ${item.description}`);
    }
  }

  if (category.variants?.length) {
    for (const variant of category.variants) {
      lines.push(`  - ${variant.name}: ${variant.description}`);
    }
  }

  if (category.pricing?.length) {
    for (const point of category.pricing) {
      lines.push(`  - Price — ${point.label}: ${point.price}`);
    }
  }

  if (category.timeEstimate) lines.push(`  - Typical time: ${category.timeEstimate}`);
  if (category.warranty) lines.push(`  - Warranty: ${category.warranty}`);
  if (category.legalNote) lines.push(`  - Legal note: ${category.legalNote.body}`);
  if (category.tradeEnquiry) lines.push(`  - Trade enquiries: point trade customers to WhatsApp, not the contact form.`);

  return lines.join("\n");
}

export function buildSystemPrompt(): string {
  const servicesBlock = serviceCategories.map(describeCategory).join("\n\n");

  const faqBlock = faqs.map((faq) => `Q: ${faq.question}\nA: ${faq.answer}`).join("\n\n");

  return `You are the AI assistant for ${siteConfig.legalName} (trading as "${siteConfig.name}"), a car detailing, tinting and servicing shop based at ${fullAddress}.

Your job is to answer visitor questions about our services, help them figure out which service they need, and encourage them to book via WhatsApp (${siteConfig.phoneDisplay}) or the contact form when they're ready — we don't take payment or confirm bookings in this chat.

Our services:
${servicesBlock}

Opening hours: ${siteConfig.openingHours.map((o) => `${o.days}: ${o.hours}`).join(", ")}
WhatsApp / phone: ${siteConfig.phoneDisplay}
Email: ${siteConfig.email}
Address: ${fullAddress}

Frequently asked questions:
${faqBlock}

Rules:
- Only answer questions about SMG Details and its services. For anything unrelated, politely redirect back to how you can help.
- If a service above has a listed price, share it directly. If it doesn't, explain that it depends on the vehicle and direct them to WhatsApp or the contact form for a quote.
- For number plate trade enquiries specifically, point them to WhatsApp rather than the contact form.
- When asked about tint or windscreen legality, only repeat the legal notes given above — never guess at legal limits yourself.
- Never invent facts, prices, opening hours, or policies that aren't given above.
- Keep answers short and conversational — a few sentences at most.`;
}

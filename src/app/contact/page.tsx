import type { Metadata } from "next";
import { PostForm } from "@/components/PostForm";
import { PageHero } from "@/components/PageHero";
import { site, whatsappHref } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Questions about your number plates? Call, WhatsApp or message PlatedUp.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="We're here to help" title="Contact Us">
        Questions about your plates or an order? The quickest way to reach us is WhatsApp.
      </PageHero>
      <div className="mx-auto grid max-w-6xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          <a href={whatsappHref} className="block rounded-3xl border border-line bg-surface p-6 hover:border-[#b8901f]">
            <p className="eyebrow">WhatsApp</p>
            <p className="mt-1 font-display text-2xl font-bold">Chat with us</p>
            <p className="text-muted">The quickest way to talk to someone · {site.hours}</p>
          </a>
          <a href={`mailto:${site.email}`} className="block rounded-3xl border border-line bg-surface p-6 hover:border-[#b8901f]">
            <p className="eyebrow">Email</p>
            <p className="mt-1 break-all font-display text-2xl font-bold">{site.email}</p>
          </a>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <h2 className="font-display text-3xl font-bold">Send us a message</h2>
          <div className="mt-6">
            <PostForm
              action="/api/contact"
              submitLabel="Send Message"
              success={
                <>
                  <p className="font-display text-3xl font-bold">Message sent</p>
                  <p className="mt-2 text-muted">Thanks, we&apos;ll get back to you soon.</p>
                </>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold">Name</span>
                  <input className="field" name="name" autoComplete="name" required />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">Email</span>
                  <input className="field" name="email" type="email" autoComplete="email" required />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-semibold">
                    Phone <span className="font-normal text-muted">(optional)</span>
                  </span>
                  <input className="field" name="phone" type="tel" autoComplete="tel" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold">
                    Order number <span className="font-normal text-muted">(if you have one)</span>
                  </span>
                  <input className="field" name="ref" />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-semibold">Message</span>
                  <textarea className="field min-h-36" name="message" required />
                </label>
              </div>
            </PostForm>
          </div>
        </div>
      </div>
    </>
  );
}

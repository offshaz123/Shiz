import Link from "next/link";
import { policyLinks, site, whatsappHref } from "@/lib/site";
import { products } from "@/lib/content";

const quickLinks = [
  { href: "/design", label: "Plate Builder" },
  ...products.map((p) => ({ href: `/${p.slug}`, label: p.heading })),
  { href: "/faqs", label: "FAQs" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About Us" },
  { href: "/upload-documents", label: "Upload Documents" },
];

export function Footer() {
  return (
    <footer className="gold-deep">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <h2 className="font-display text-2xl font-bold">{site.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/85">
            Premium, handcrafted number plates. Fully road legal, with free UK tracked delivery on orders over £70.
          </p>
          <a href={site.instagram} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
            </svg>
            {site.instagramHandle}
          </a>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold">Quick Links</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            {quickLinks.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold">Legal</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            {policyLinks.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white hover:underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="font-display text-xl font-bold">Contact Us</h2>
          <ul className="mt-4 space-y-2 text-sm text-white/85">
            <li>
              <Link href="/contact" className="hover:text-white hover:underline">
                Contact Form
              </Link>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-white hover:underline">
                {site.email}
              </a>
            </li>
            <li>
              <a href={whatsappHref} className="hover:text-white hover:underline">
                Chat on WhatsApp
              </a>
            </li>
            <li>{site.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/20">
        <div className="mx-auto max-w-7xl space-y-1 px-4 py-6 text-center text-xs text-white/75 sm:px-6">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>DVLA registered supplier | BS AU 145e compliant plates</p>
          {site.companyNumber && <p>Company No: {site.companyNumber}</p>}
        </div>
      </div>
    </footer>
  );
}

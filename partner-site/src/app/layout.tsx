import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ChromeSlot } from "@/components/ChromeSlot";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { CookieConsent } from "@/components/CookieConsent";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/StructuredData";
import { brand } from "@/lib/brand";

// Inter throughout — body and headlines both. It used to pair Inter with
// Space Grotesk for headlines; one family across the whole site is quieter
// and loads one font file instead of two. The weights are the ones the
// headlines and the wordmark actually use, so nothing is downloaded unused.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const defaultTitle = `${brand.name} — Business accounts for UK importers and wholesalers`;

/** One theme, so the browser chrome matches the page. */
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: defaultTitle,
    template: `%s | ${brand.shortName}`,
  },
  description: brand.description,
  keywords: [
    "business account for importers",
    "business account for wholesalers UK",
    "pay overseas suppliers",
    "USD AED HKD payments UK",
    "foreign exchange for importers",
    "business account declined by bank",
    "payments for mobile phone wholesalers",
    "remittance software for MSBs",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    title: defaultTitle,
    description: brand.description,
    url: brand.url,
    siteName: brand.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: brand.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-GB"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <ChromeSlot>
          <Header />
        </ChromeSlot>
        <main className="flex-1">{children}</main>
        <ChromeSlot>
          <Footer />
        </ChromeSlot>
        <WhatsAppButton />
        <CookieConsent />
      </body>
    </html>
  );
}

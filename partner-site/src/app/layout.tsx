import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/StructuredData";
import { brand } from "@/lib/brand";

// Inter for body, Space Grotesk for headlines. Deliberately a geometric sans
// rather than the serif our provider uses — same trade, different voice.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const displaySans = Space_Grotesk({
  variable: "--font-display-sans",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const defaultTitle = `${brand.name} — Business accounts for UK importers and wholesalers`;

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
      className={`${inter.variable} ${displaySans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

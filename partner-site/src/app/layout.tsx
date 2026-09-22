import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/StructuredData";
import { brand } from "@/lib/brand";

// Inter for everything, Playfair for headlines — the pairing our provider's
// own site uses, and the reason its pages read as a financial institution
// rather than a software startup.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <OrganizationJsonLd />
        <WebSiteJsonLd />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
        </ThemeProvider>
      </body>
    </html>
  );
}

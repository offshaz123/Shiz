import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/StructuredData";
import { brand } from "@/lib/brand";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const defaultTitle = `Business Accounts for UK Importers & Wholesalers | ${brand.name}`;

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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

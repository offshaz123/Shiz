import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { MetaPixel } from "@/components/MetaPixel";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/StructuredData";
import { siteConfig } from "@/lib/site-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// The homepage carries the full legal name because that's the entity Google
// ties the schema to. Inner pages use the short name, which is both what
// people actually type and 6 characters that titles can spend on content.
const defaultTitle = `Marketing Agency UK | ${siteConfig.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  keywords: [
    "marketing agency UK",
    "Meta ads agency",
    "Instagram ads agency UK",
    "Google Ads agency UK",
    "SEO agency UK",
    "website design UK",
    "marketing agency London",
    "Facebook ads management",
    "Instagram ads agency London",
    "lead generation agency",
    "automotive lead generation",
    "social media marketing agency",
    "AI receptionist for business",
    "all-in-one CRM for small business",
  ],
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Rendered only once the codes are filled in, so an empty string doesn't
  // put a meaningless verification tag on every page.
  ...((siteConfig.googleSiteVerification || siteConfig.bingSiteVerification) && {
    verification: {
      ...(siteConfig.googleSiteVerification && {
        google: siteConfig.googleSiteVerification,
      }),
      ...(siteConfig.bingSiteVerification && {
        other: { "msvalidate.01": siteConfig.bingSiteVerification },
      }),
    },
  }),
  openGraph: {
    title: defaultTitle,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: siteConfig.description,
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MetaPixel />
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

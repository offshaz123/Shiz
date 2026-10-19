import type { Metadata } from "next";
import { Barlow_Condensed, Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Tracking } from "@/components/Tracking";
import { site } from "@/lib/site";
import { PriceSync } from "@/components/PriceSync";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { loadPriceChanges } from "@/lib/prices";
import { getPriceChanges } from "@/lib/plates";

const body = Inter({ variable: "--font-body", subsets: ["latin"] });
const heading = Rajdhani({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});
// Closest freely licensed face to the Charles Wright plate font, used for previews.
const plate = Barlow_Condensed({
  variable: "--font-plate-face",
  subsets: ["latin"],
  weight: ["600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Road-Legal 3D & 4D Number Plates`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    type: "website",
    locale: "en_GB",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  await loadPriceChanges();
  return (
    <html lang="en-GB" className={`${body.variable} ${heading.variable} ${plate.variable}`} suppressHydrationWarning>
      <head>
        {/* Apply a saved dark-mode choice before the page paints, so it doesn't flash white. */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem("pu-theme")==="dark")document.documentElement.dataset.theme="dark"}catch(e){}` }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <PriceSync changes={getPriceChanges()} />
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
          <Tracking />
        </CartProvider>
      </body>
    </html>
  );
}

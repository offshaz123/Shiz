import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | PlatedUp Admin" },
  robots: { index: false },
  // Lets the admin be added to a phone's home screen as its own app.
  manifest: "/admin.webmanifest",
  appleWebApp: { capable: true, title: "PU Admin", statusBarStyle: "black-translucent" },
  icons: { apple: "/icons/admin-180.png" },
};

// Visit recordings (Microsoft Clarity) never show what's on admin pages.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div data-clarity-mask="true">{children}</div>;
}

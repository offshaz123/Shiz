import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | PlatedUp Admin" }, robots: { index: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}

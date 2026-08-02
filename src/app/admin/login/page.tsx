import type { Metadata } from "next";
import { Logo } from "@/components/Logo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-border bg-surface p-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        <h1 className="mt-6 text-center text-xl font-bold text-foreground">Admin sign in</h1>
        <p className="mt-1 text-center text-sm text-muted">Enquiries, stats &amp; bookings</p>
        <div className="mt-8">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/account");
  return (
    <div className="bg-surface px-4 py-16">
      <div className="mx-auto max-w-md rounded-3xl border border-line bg-white p-6 shadow-sm sm:p-8">
        <h1 className="font-display text-4xl font-bold">Create an account</h1>
        <p className="mt-1 mb-6 text-muted">Track your orders and check out faster next time.</p>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}

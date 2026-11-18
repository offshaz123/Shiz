import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { currentClient } from "@/lib/client-auth";
import { getBusinessProfile } from "@/lib/invoices";
import { BusinessDetails } from "@/components/BusinessDetails";
import { LoginForm } from "../LoginForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Business details",
  robots: { index: false, follow: false },
};

export default async function BusinessPage() {
  const client = await currentClient();
  if (!client) return <LoginForm failed={false} />;

  const profile = await getBusinessProfile(client.id);
  if (!profile) notFound();

  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 lg:py-10">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Business details
      </h1>
      <p className="mt-1.5 text-sm text-muted">
        What appears on the invoices you send. Fill it in once and every invoice after that
        carries it. Type it however you like — capitals, spaces, it sorts itself out. Boxes save
        when you click away.
      </p>

      <div className="mt-6">
        <BusinessDetails profile={profile} />
      </div>
    </div>
  );
}

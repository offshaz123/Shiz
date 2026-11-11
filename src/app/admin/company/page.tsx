import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/admin-auth";
import { LoginForm } from "../LoginForm";
import { CompanyLookup } from "@/components/CompanyLookup";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company check",
  robots: { index: false, follow: false },
};

export default async function AdminCompanyPage() {
  if (!(await isAdmin())) return <LoginForm />;

  return (
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Company check</h1>
          <p className="mt-1 text-sm text-muted">
            The official register. Limited company or a person trading under a name — which decides
            what you are allowed to send them.
          </p>
        </div>
        <Link
          href="/admin/prospects"
          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
        >
          Who to call
        </Link>
      </div>

      <div className="mt-7">
        <CompanyLookup />
      </div>

      <p className="mt-8 text-xs leading-relaxed text-muted">
        Separate from the call list on purpose. The register is about a legal entity and the call
        list is about a shop front, and they do not always line up: plenty of trades are one person,
        and plenty of addresses hold half a dozen companies. Stamping a guess at the match onto a
        prospect would look like a fact and sometimes be wrong.
      </p>
    </div>
  );
}

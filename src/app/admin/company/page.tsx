import type { Metadata } from "next";
import { isAdmin } from "@/lib/admin-auth";
import { AdminHeading } from "@/components/AdminHeading";
import { LoginForm } from "../LoginForm";
import { CompanyLookup } from "@/components/CompanyLookup";
import { RegisterFinder } from "@/components/RegisterFinder";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Company check",
  robots: { index: false, follow: false },
};

export default async function AdminCompanyPage() {
  if (!(await isAdmin())) return <LoginForm />;

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
      <AdminHeading title="Company check">
        The official register. A limited company or a person trading under a name, which decides what you are allowed to send them.
      </AdminHeading>

      <div className="mt-7">
        <CompanyLookup />
      </div>

      <div className="mt-8">
        <RegisterFinder />
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

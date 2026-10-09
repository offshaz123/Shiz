import type { Metadata } from "next";
import Link from "next/link";
import { PostForm } from "@/components/PostForm";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Upload Documents",
  description: "Upload your V5C and ID so we can make your number plates.",
};

export default async function UploadDocuments(props: PageProps<"/upload-documents">) {
  const { ref } = await props.searchParams;
  const orderRef = typeof ref === "string" ? ref.replace(/[^A-Z0-9-]/gi, "").slice(0, 20) : "";
  return (
    <>
      <PageHero eyebrow="Required by law" title="Upload Documents">
        A clear photo from your phone is perfect. We&apos;ll start making your plates as soon as
        we&apos;ve checked them.
      </PageHero>
      <div className="mx-auto max-w-2xl px-4 pb-20 sm:px-6">
        <PostForm
          action="/api/documents"
          submitLabel="Upload Documents"
          success={
            <>
              <p className="font-display text-3xl font-bold">Thanks, we&apos;ve got them</p>
              <p className="mt-2 text-muted">We&apos;ll check your documents and get your plates made.</p>
            </>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Order number</span>
              <input className="field uppercase" name="ref" defaultValue={orderRef} placeholder="PU-XXXXX" required />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold">Email used on the order</span>
              <input className="field" name="email" type="email" autoComplete="email" required />
            </label>
          </div>
          <label className="block rounded-2xl border-2 border-dashed border-line bg-surface p-5">
            <span className="block font-semibold">Proof you own the reg</span>
            <span className="mb-3 block text-sm text-muted">V5C logbook, V5C/2 new keeper slip, V750 or V778 certificate, or lease agreement</span>
            <input name="entitlement" type="file" accept="image/*,application/pdf" required className="block w-full text-sm" />
          </label>
          <label className="block rounded-2xl border-2 border-dashed border-line bg-surface p-5">
            <span className="block font-semibold">ID in your name</span>
            <span className="mb-3 block text-sm text-muted">Driving licence, passport, or a utility bill / bank statement from the last 6 months</span>
            <input name="identity" type="file" accept="image/*,application/pdf" required className="block w-full text-sm" />
          </label>
          <p className="text-sm text-muted">
            Not sure which documents count? See the{" "}
            <Link href="/legal#documents" className="font-semibold text-gold underline">
              full list
            </Link>
            .
          </p>
        </PostForm>
      </div>
    </>
  );
}

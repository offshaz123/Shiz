import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { TrackOrder } from "@/components/TrackOrder";

export const metadata: Metadata = {
  title: "Track My Order",
  description: "Check the progress of your PlatedUp number plate order and track your parcel.",
  alternates: { canonical: "/track" },
};

export default async function TrackPage(props: PageProps<"/track">) {
  const { ref } = await props.searchParams;
  return (
    <>
      <PageHero eyebrow="Order status" title="Track My Order">
        Enter your order number and email to see where your plates are.
      </PageHero>
      <div className="mx-auto max-w-xl px-4 pb-20 sm:px-6">
        <TrackOrder initialRef={typeof ref === "string" ? ref.replace(/[^A-Z0-9-]/gi, "").slice(0, 20) : ""} />
      </div>
    </>
  );
}

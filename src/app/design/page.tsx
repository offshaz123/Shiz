import type { Metadata } from "next";
import { Suspense } from "react";
import { Builder } from "@/components/Builder";
import { DesignFromLink } from "@/components/DesignFromLink";

// Rebuilt hourly so launch prices switch over on the day they rise.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Number Plate Builder: Design Your Plates Online",
  description:
    "Design road-legal 2D, 3D gel and 4D number plates or show plates with a live preview. Made in Barking, dispatched same day before 2pm.",
  alternates: { canonical: "/design" },
};

// Built once and cached, so it opens straight away. The plain builder shows
// first; a link's registration and style are filled in by the browser.
export default function DesignPage() {
  return (
    <Suspense fallback={<Builder initial={{}} />}>
      <DesignFromLink />
    </Suspense>
  );
}

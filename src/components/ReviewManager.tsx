"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Stars } from "./Stars";

type Row = {
  id: number;
  name: string;
  email: string;
  rating: number;
  body: string;
  verified: boolean;
  status: "pending" | "approved" | "hidden";
  date: string;
};

const badge = {
  pending: "bg-[#fff5ec] text-[#8a4a12]",
  approved: "bg-[#e7f6ec] text-[#1f7a3d]",
  hidden: "bg-[#f3f3f3] text-[#555]",
};
const label = { pending: "Waiting for approval", approved: "Showing on website", hidden: "Hidden" };

// Admin → Reviews: approve customer reviews before they show on the homepage.
export function ReviewManager({ reviews }: { reviews: Row[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function send(id: number, action: "approve" | "hide" | "delete") {
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setBusy(false);
    if (!res.ok) setError((await res.json().catch(() => ({}))).error ?? "Something went wrong");
    router.refresh();
  }

  const btn = "rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold disabled:opacity-50";
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-2xl font-bold">Customer reviews</h2>
        <p className="text-sm text-muted">
          New reviews wait here until you approve them. Only approved ones show on the homepage. Customers&apos; emails are never shown.
        </p>
        {error && <p className="mt-2 text-sm font-semibold text-[#b42318]">{error}</p>}
      </div>
      {reviews.length === 0 ? (
        <p className="p-5 text-muted">No reviews yet. They&apos;ll appear here as soon as a customer leaves one on the homepage.</p>
      ) : (
        <ul className="divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div className="min-w-0 max-w-2xl">
                <p className="flex flex-wrap items-center gap-2">
                  <Stars rating={r.rating} />
                  <span className="font-semibold">{r.name}</span>
                  {r.verified && <span className="rounded-full bg-[#e7f6ec] px-2 py-0.5 text-xs font-bold text-[#1f7a3d]">Verified buyer</span>}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badge[r.status]}`}>{label[r.status]}</span>
                </p>
                <p className="mt-2 whitespace-pre-line text-sm">{r.body}</p>
                <p className="mt-1 text-xs text-muted">
                  {r.email} · {r.date}
                </p>
              </div>
              <div className="flex gap-2">
                {r.status !== "approved" && (
                  <button type="button" disabled={busy} onClick={() => send(r.id, "approve")} className={`${btn} border-[#9fd3ae] text-[#1f7a3d]`}>
                    Approve
                  </button>
                )}
                {r.status === "approved" && (
                  <button type="button" disabled={busy} onClick={() => send(r.id, "hide")} className={btn}>
                    Hide
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => window.confirm(`Delete ${r.name}'s review?`) && send(r.id, "delete")}
                  className={`${btn} border-[#f1b4a5] text-[#b42318]`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

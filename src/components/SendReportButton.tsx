"use client";

import { useState } from "react";

// Sends the weekly report email straight away (it also goes automatically every Monday).
export function SendReportButton() {
  const [state, setState] = useState<{ busy: boolean; note: string; ok: boolean }>({ busy: false, note: "", ok: true });
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        disabled={state.busy}
        className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold disabled:opacity-50"
        onClick={async () => {
          setState({ busy: true, note: "", ok: true });
          const res = await fetch("/api/admin/weekly-report", { method: "POST" }).catch(() => null);
          const json = await res?.json().catch(() => ({}));
          setState({ busy: false, ok: Boolean(res?.ok), note: res?.ok ? json.message : (json?.error ?? "Something went wrong.") });
        }}
      >
        {state.busy ? "Sending…" : "Email me this week's report"}
      </button>
      {state.note && <span className={`text-sm font-semibold ${state.ok ? "text-[#1f7a3d]" : "text-[#b42318]"}`}>{state.note}</span>}
    </span>
  );
}

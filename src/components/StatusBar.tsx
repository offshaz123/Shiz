import { healthChecks } from "@/lib/health";
import { RecheckButton } from "./RecheckButton";

// Green when everything the shop relies on is working; red (or amber for
// smaller problems) with what's wrong and how to fix it.
export async function StatusBar() {
  const { minsAgo: mins, checks } = await healthChecks();
  const problems = checks.filter((c) => c.state !== "ok");
  const bad = checks.some((c) => c.state === "fail");
  const tone = bad ? "border-[#f1b8b2] bg-[#fdecec]" : problems.length ? "border-[#e8d89a] bg-[#fdf8e7]" : "border-[#9fd3ae] bg-[#f1faf3]";
  return (
    <details className={`mb-6 rounded-2xl border px-4 py-3 ${tone}`} open={problems.length > 0}>
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2">
        <span className="font-semibold">
          {problems.length === 0
            ? "✅ Everything's working"
            : `${bad ? "🔴" : "🟡"} ${problems.length} thing${problems.length > 1 ? "s need" : " needs"} attention: ${problems.map((p) => p.name).join(", ")}`}
        </span>
        <span className="flex items-center gap-3 text-xs text-muted">
          Checked {mins === 0 ? "just now" : `${mins} min ago`} · tap for details
          <RecheckButton />
        </span>
      </summary>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {checks.map((c) => (
          <li key={c.name} className="rounded-xl bg-white/70 px-3 py-2 text-sm">
            <span className="font-semibold">
              {c.state === "ok" ? "🟢" : c.state === "warn" ? "🟡" : "🔴"} {c.name}
            </span>
            <span className="block text-muted">{c.detail}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

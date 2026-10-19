import { fmtDateTime } from "@/lib/admin";
import type { EmailKind, EmailLog } from "@/lib/email-log";
import type { Order } from "@/lib/orders";
import { money } from "@/lib/plates";

type State = "done" | "failed" | "waiting";
type Step = { title: string; state: State; lines: string[]; email?: EmailLog | null };

const emailNames: Record<EmailKind, string> = {
  receipt: "Order confirmation",
  shop: "Your order email",
  dispatched: "\"On its way\" email",
  cancelled: "Cancellation email",
  refunded: "Refund email",
  reminder: "Checkout reminder",
  docs_reminder: "Documents reminder",
  docs_retake: "New photo request",
};

function lastEmail(emails: EmailLog[], kind: EmailKind) {
  return [...emails].reverse().find((e) => e.kind === kind) ?? null;
}

function EmailStatus({ email, none }: { email: EmailLog | null | undefined; none: string }) {
  if (!email) return <p className="text-xs text-muted">{none}</p>;
  if (email.status === "failed")
    return (
      <p className="text-xs font-semibold text-[#b42318]">
        ✗ Email failed {fmtDateTime(email.created_at)}. Press &ldquo;Resend&rdquo; below.
        {email.error && <span className="block font-normal">{email.error}</span>}
      </p>
    );
  return (
    <div className="space-y-0.5 text-xs">
      <p className="font-semibold text-[#1f7a3d]">✓ Email sent {fmtDateTime(email.created_at)}</p>
      <p className={email.opened_at ? "font-semibold text-[#1f7a3d]" : "text-muted"}>
        {email.opened_at ? `✓ Opened by customer ${fmtDateTime(email.opened_at)}` : "Not opened yet"}
      </p>
    </div>
  );
}

// The order's progress, step by step, with each customer email and whether
// it was sent and opened.
export function OrderTimeline({
  order,
  emails,
  events,
}: {
  order: Order;
  emails: EmailLog[];
  events: { event: string; created_at: Date }[];
}) {
  const at = (event: string) => [...events].reverse().find((e) => e.event === event)?.created_at ?? null;
  const paid = order.paid_at !== null || ["paid", "in_production", "dispatched"].includes(order.status);
  const madeStage = ["in_production", "dispatched"].includes(order.status);
  const ended = order.status === "cancelled" || order.status === "refunded";
  const receipt = lastEmail(emails, "receipt");
  const dispatchEmail = lastEmail(emails, "dispatched");

  const steps: Step[] = [
    { title: "Order placed", state: "done", lines: [fmtDateTime(order.created_at)] },
    {
      title: "Payment received",
      state: paid ? "done" : "waiting",
      lines: paid
        ? [order.amount_paid !== null ? money(order.amount_paid) : "Marked paid", order.paid_at ? fmtDateTime(order.paid_at) : ""]
        : ["Waiting for payment"],
    },
    {
      title: "Confirmation email",
      state: receipt?.status === "sent" ? "done" : receipt?.status === "failed" ? "failed" : "waiting",
      lines: [],
      email: receipt,
    },
    {
      title: "In production",
      state: madeStage ? "done" : "waiting",
      lines: madeStage ? [at("in_production") ? fmtDateTime(at("in_production")) : "Started"] : ["Not started"],
    },
    ended
      ? {
          title: order.status === "refunded" ? "Cancelled & refunded" : "Cancelled",
          state: lastEmail(emails, order.status as EmailKind)?.status === "failed" ? "failed" : "done",
          lines: at(order.status) ? [fmtDateTime(at(order.status))] : [],
          email: lastEmail(emails, order.status as EmailKind),
        }
      : {
          title: "Dispatched",
          state: order.status === "dispatched" ? (dispatchEmail?.status === "failed" ? "failed" : "done") : "waiting",
          lines: order.status === "dispatched" ? (at("dispatched") ? [fmtDateTime(at("dispatched"))] : []) : ["Not sent yet"],
          email: order.status === "dispatched" ? dispatchEmail : undefined,
        },
  ];

  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <h2 className="mb-4 font-display text-xl font-bold">Order progress</h2>
      <ol className="grid gap-4 sm:grid-cols-5 sm:gap-3">
        {steps.map((s, i) => (
          <li key={s.title} className="flex gap-3 sm:block">
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                s.state === "done"
                  ? "bg-[#1f7a3d] text-white"
                  : s.state === "failed"
                    ? "bg-[#b42318] text-white"
                    : "border-2 border-line bg-white text-muted"
              }`}
              aria-hidden
            >
              {s.state === "done" ? "✓" : s.state === "failed" ? "✗" : i + 1}
            </span>
            <div className="sm:mt-2">
              <p className="font-semibold leading-tight">{s.title}</p>
              {s.lines.filter(Boolean).map((l) => (
                <p key={l} className="text-xs text-muted">
                  {l}
                </p>
              ))}
              {s.email !== undefined && (
                <div className="mt-1">
                  <EmailStatus email={s.email} none={paid ? "Not sent yet" : "Sent once payment is received"} />
                </div>
              )}
            </div>
          </li>
        ))}
      </ol>

      {emails.length > 0 && (
        <details className="mt-5 rounded-xl border border-line p-3">
          <summary className="cursor-pointer py-1 text-sm font-semibold">All emails for this order ({emails.length})</summary>
          <ul className="mt-2 divide-y divide-line text-sm">
            {emails.map((e) => (
              <li key={e.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  <span className="font-semibold">{emailNames[e.kind]}</span>
                  <span className="text-muted"> to {e.recipient}</span>
                </span>
                <span className={`text-xs font-semibold ${e.status === "failed" ? "text-[#b42318]" : "text-[#1f7a3d]"}`}>
                  {e.status === "failed" ? `✗ Failed ${fmtDateTime(e.created_at)}` : `✓ Sent ${fmtDateTime(e.created_at)}`}
                  {e.opened_at && ` · Opened ${fmtDateTime(e.opened_at)}`}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
      <p className="mt-3 text-xs text-muted">
        &ldquo;Opened&rdquo; shows when the customer&apos;s email app loads the email. Some apps hide this, so &ldquo;Sent&rdquo; with no
        &ldquo;Opened&rdquo; doesn&apos;t always mean they haven&apos;t seen it.
      </p>
    </section>
  );
}

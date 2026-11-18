import type { Invoice, InvoiceSender } from "@/lib/invoices";
import { pounds } from "@/lib/invoices";
import { siteConfig } from "@/lib/site-config";

/**
 * The invoice itself — the thing their customer receives.
 *
 * White, on paper, regardless of the theme. An invoice that comes out of a
 * dark-mode dashboard as white text on black is an invoice nobody can print,
 * and printing it is half of what it is for. So this is the one place in the
 * site that fixes its own colours instead of using the theme's.
 *
 * It renders the same in the browser, in print, and inside an email, because
 * every rule here is a plain colour and a plain border rather than anything
 * that needs a stylesheet an email client will throw away.
 *
 * It says what it does not have rather than hiding it. A missing address or
 * no way to pay is printed as a line asking for it, because an invoice sent
 * with no payment details is worse than one not sent at all: the customer
 * has been asked for money and given no way to send it.
 */

function date(iso: string): string {
  if (!iso) return "";
  const at = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(at.getTime())) return iso;
  return at.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/** Address boxes are typed with line breaks, and have to print that way. */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <span key={i} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

export function InvoiceDocument({
  invoice,
  sender,
}: {
  invoice: Invoice;
  sender: InvoiceSender;
}) {
  return (
    <article className="mx-auto w-full max-w-[820px] bg-white p-7 text-[#111827] sm:p-10">
      <header className="flex flex-wrap items-start justify-between gap-6 border-b border-[#e5e7eb] pb-7">
        <div className="flex items-start gap-4">
          {sender.logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sender.logoUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-lg object-contain"
            />
          )}
          <div className="text-[13px] leading-relaxed">
            <p className="text-base font-bold">{sender.name}</p>
            {sender.address && (
              <p className="mt-1 text-[#4b5563]">
                <Lines text={sender.address} />
              </p>
            )}
            {sender.phone && <p className="mt-1 text-[#4b5563]">{sender.phone}</p>}
            {sender.email && <p className="text-[#4b5563]">{sender.email}</p>}
            {sender.vatNumber && (
              <p className="mt-1 text-[#4b5563]">VAT no. {sender.vatNumber}</p>
            )}
          </div>
        </div>

        <div className="text-right text-[13px]">
          <p className="text-2xl font-bold tracking-tight">INVOICE</p>
          <p className="mt-1 font-semibold tabular-nums">
            No. {String(invoice.number).padStart(4, "0")}
          </p>
          <p className="mt-2 text-[#4b5563]">Issued {date(invoice.issuedOn)}</p>
          {invoice.dueOn && <p className="text-[#4b5563]">Due {date(invoice.dueOn)}</p>}
        </div>
      </header>

      <section className="mt-7 text-[13px] leading-relaxed">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">
          Billed to
        </p>
        <p className="mt-1.5 text-base font-semibold">{invoice.customerName}</p>
        {invoice.customerAddress && (
          <p className="mt-0.5 text-[#4b5563]">
            <Lines text={invoice.customerAddress} />
          </p>
        )}
        {invoice.customerEmail && (
          <p className="mt-0.5 text-[#4b5563]">{invoice.customerEmail}</p>
        )}
      </section>

      <table className="mt-7 w-full border-collapse text-[13px]">
        <thead>
          <tr className="border-b-2 border-[#111827] text-left">
            <th scope="col" className="py-2 font-semibold">
              Description
            </th>
            <th scope="col" className="w-20 py-2 text-right font-semibold">
              Qty
            </th>
            <th scope="col" className="w-28 py-2 text-right font-semibold">
              Each
            </th>
            <th scope="col" className="w-28 py-2 text-right font-semibold">
              Amount
            </th>
          </tr>
        </thead>
        <tbody>
          {invoice.lines.map((line) => (
            <tr key={line.id} className="border-b border-[#e5e7eb] align-top">
              <td className="py-2.5 pr-3">{line.description}</td>
              <td className="py-2.5 text-right tabular-nums">
                {/* A whole number of jobs should not read as 2.00. */}
                {Number.isInteger(line.quantity) ? line.quantity : line.quantity.toFixed(2)}
              </td>
              <td className="py-2.5 text-right tabular-nums">{pounds(line.unitPence)}</td>
              <td className="py-2.5 text-right font-medium tabular-nums">
                {pounds(Math.round(line.quantity * line.unitPence))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-5 flex justify-end">
        <dl className="w-full max-w-xs text-[13px]">
          <div className="flex justify-between py-1.5">
            <dt className="text-[#4b5563]">Subtotal</dt>
            <dd className="tabular-nums">{pounds(invoice.subtotalPence)}</dd>
          </div>
          {invoice.vatRate > 0 && (
            <div className="flex justify-between py-1.5">
              <dt className="text-[#4b5563]">VAT at {invoice.vatRate}%</dt>
              <dd className="tabular-nums">{pounds(invoice.vatPence)}</dd>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t-2 border-[#111827] py-2.5 text-base font-bold">
            <dt>Total due</dt>
            <dd className="tabular-nums">{pounds(invoice.totalPence)}</dd>
          </div>
        </dl>
      </div>

      <footer className="mt-8 border-t border-[#e5e7eb] pt-5 text-[12px] leading-relaxed">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[#6b7280]">
          How to pay
        </p>
        {sender.paymentDetails ? (
          <p className="mt-1.5 text-[#374151]">
            <Lines text={sender.paymentDetails} />
          </p>
        ) : (
          // Said on the document rather than only in the dashboard, because
          // this is the version that gets looked at before it is sent.
          <p className="mt-1.5 font-medium text-[#b45309]">
            No payment details yet — add them in Business details before you send this.
          </p>
        )}

        {invoice.notes && (
          <p className="mt-4 whitespace-pre-line text-[#4b5563]">{invoice.notes}</p>
        )}

        {/* Small, at the bottom, under a rule. It travels to every customer
            of every client, which is the whole point, but an invoice is
            their document and our name on it should read as a footer and
            never as a second sender. */}
        <p className="mt-7 border-t border-[#f3f4f6] pt-3 text-center text-[10px] text-[#9ca3af]">
          Powered by {siteConfig.url.replace(/^https?:\/\//, "")}
        </p>
      </footer>
    </article>
  );
}

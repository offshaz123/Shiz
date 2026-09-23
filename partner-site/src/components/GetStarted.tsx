import { Icon } from "@/components/Icon";

/**
 * Three steps, with the line between them.
 *
 * The numbered discs take the tile tones so the row belongs to the rest of the
 * page, and the connector is drawn only from `md` up, where the steps sit side
 * by side and a line between them means something.
 */
const steps = [
  {
    icon: "handshake",
    title: "Tell us the shape of the business",
    body: "What you trade, roughly what comes in each month, and the currency that goes out. A phone call is usually enough to know whether the account fits.",
  },
  {
    icon: "document",
    title: "Send the file",
    body: "Company documents, ID and address for the directors, proof of the trading address and recent statements. A complete file first time is the single biggest factor in how fast the answer comes back.",
  },
  {
    icon: "wallet",
    title: "The account opens",
    body: "Named in your company. Your customers pay in, you convert at a rate you were quoted, and the first supplier payment goes out.",
  },
];

export function GetStarted() {
  return (
    <div className="grid gap-10 md:grid-cols-3 md:gap-6">
      {steps.map((step, index) => (
        <div key={step.title} className="relative">
          {index < steps.length - 1 && (
            <span
              className="absolute left-[calc(50%+2.25rem)] right-[-1.5rem] top-7 hidden h-px bg-border md:block"
              aria-hidden="true"
            />
          )}

          <div className="relative flex flex-col items-center text-center">
            <span
              className={`icon-tile icon-tile-${index + 1} flex h-14 w-14 items-center justify-center rounded-2xl`}
            >
              <Icon name={step.icon} className="h-6 w-6" />
            </span>
            <span className="font-mono mt-4 text-xs text-muted">0{index + 1}</span>
            <h3 className="font-display mt-2 text-lg font-semibold">{step.title}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

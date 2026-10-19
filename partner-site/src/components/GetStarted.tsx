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
    body: "What you trade, roughly what comes in each month, and the currency that goes out. A short email is usually enough to know whether the account fits.",
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
              className="absolute left-[calc(50%+2.75rem)] right-[calc(0.5rem-50%)] top-9 hidden h-px bg-border md:block"
              aria-hidden="true"
            />
          )}

          <div className="relative flex flex-col items-center text-center">
            {/* The sticker. The number is the whole point of it, so the number
                is what is big; the icon rides the corner on a white chip. The
                tilt alternates so a row of three does not look stamped. */}
            <span
              className={`step-sticker icon-tile-${index + 1} relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-[1.35rem]`}
              style={{ transform: `rotate(${index % 2 === 0 ? -6 : 5}deg)` }}
            >
              <span className="font-display text-2xl font-bold tabular-nums">
                0{index + 1}
              </span>
              <span
                className={`step-chip absolute -right-2.5 -bottom-2.5 flex h-8 w-8 items-center justify-center rounded-xl`}
              >
                <Icon name={step.icon} className="h-4 w-4" />
              </span>
            </span>
            <h3 className="font-display mt-7 text-lg font-semibold">{step.title}</h3>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

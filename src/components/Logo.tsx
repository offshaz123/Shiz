import Image from "next/image";
import Link from "next/link";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5 shrink-0">
      <Image
        src="/logo-dark-icon.png"
        alt="SMG Details"
        width={1082}
        height={335}
        priority
        className="hidden h-8 w-auto dark:block"
      />
      <Image
        src="/logo-light-icon.png"
        alt="SMG Details"
        width={1082}
        height={335}
        priority
        className="block h-8 w-auto dark:hidden"
      />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-bold tracking-tight">
            <span className="brand-gradient-text">DETAILS</span>
          </span>
          <span className="text-[10px] font-semibold tracking-[0.25em] text-muted">
            SHAZ MOTOR GROUP
          </span>
        </span>
      )}
    </Link>
  );
}

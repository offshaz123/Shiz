import { siteConfig } from "@/lib/site-config";

/**
 * A nav tab styled like a UK rear number plate — yellow face, black border,
 * black lettering. Same colours in both themes, because a plate is yellow
 * whatever the light is doing. Goes straight out to the PlatedUp store:
 * plates are ordered and posted, so there is nothing to see on this site.
 */
export function PlateTab({
  className = "",
  onClick,
}: {
  className?: string;
  onClick?: () => void;
}) {
  return (
    <a
      href={siteConfig.plateStore.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      aria-label={`Order number plates at ${siteConfig.plateStore.name}`}
      className={`group inline-flex items-stretch overflow-hidden rounded-[5px] border-2 border-black bg-[#ffd400] shadow-sm transition-transform hover:scale-[1.04] dark:border-black/70 ${className}`}
    >
      <span className="flex w-[18px] shrink-0 items-center justify-center bg-[#003399] text-[7px] leading-none font-bold tracking-tight text-[#ffd400]">
        UK
      </span>
      <span className="px-2.5 py-1 text-[13px] leading-tight font-extrabold tracking-[0.08em] whitespace-nowrap text-black uppercase">
        Order Plates
      </span>
    </a>
  );
}

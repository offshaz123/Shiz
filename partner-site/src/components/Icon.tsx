/**
 * The house icon set.
 *
 * Line icons drawn on a 24px grid at a single stroke weight, so a row of them
 * reads as one family. They are inlined rather than pulled from an icon
 * package: two dozen paths is less weight than the dependency, and it keeps
 * the static export self-contained.
 *
 * Every icon is decorative — the label next to it carries the meaning — so
 * they are hidden from assistive tech.
 */
const paths: Record<string, React.ReactNode> = {
  collect: (
    <>
      <path d="M12 3.75v9m0 0 3.25-3.25M12 12.75 8.75 9.5" />
      <path d="M4.25 14.5v3.25a2.5 2.5 0 0 0 2.5 2.5h10.5a2.5 2.5 0 0 0 2.5-2.5V14.5" />
    </>
  ),
  convert: (
    <>
      <path d="M4.75 8.5h13.5m0 0-3.25-3.25M18.25 8.5 15 11.75" />
      <path d="M19.25 15.5H5.75m0 0L9 12.25M5.75 15.5 9 18.75" />
    </>
  ),
  pay: (
    <>
      <path d="M20.25 3.75 3.75 10.5l6.75 2.75m9.75-9.5-6 16.5-3.75-7m9.75-9.5-9.75 9.5" />
    </>
  ),
  wallet: (
    <>
      <rect x="3.25" y="5.75" width="17.5" height="12.5" rx="2.5" />
      <path d="M3.25 10.25h17.5" />
      <path d="M16.5 14.5h1.5" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M3.75 12h16.5M12 3.75c2.2 2.4 3.3 5.3 3.3 8.25S14.2 18.1 12 20.25c-2.2-2.15-3.3-5.05-3.3-8.25S9.8 6.15 12 3.75Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 2.75 4.75 5.6v5.4c0 4.2 2.9 8.1 7.25 10.25C16.35 19.1 19.25 15.2 19.25 11V5.6Z" />
      <path d="m9 11.75 2.1 2.1L15 10" />
    </>
  ),
  team: (
    <>
      <circle cx="9" cy="8.5" r="3.25" />
      <path d="M3.75 19.25a5.25 5.25 0 0 1 10.5 0" />
      <path d="M16 6.1a3.25 3.25 0 0 1 0 6.3M17.25 14.9a5.25 5.25 0 0 1 3 4.35" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.25V12l3 1.75" />
    </>
  ),
  lock: (
    <>
      <rect x="4.75" y="10.25" width="14.5" height="9.5" rx="2.25" />
      <path d="M8.25 10.25V7.5a3.75 3.75 0 0 1 7.5 0v2.75" />
    </>
  ),
  document: (
    <>
      <path d="M13.25 3.75H7.5a2.25 2.25 0 0 0-2.25 2.25v12a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25V9.25Z" />
      <path d="M13.25 3.75v5.5h5M8.75 14h6.5M8.75 17h4" />
    </>
  ),
  bolt: <path d="M13.25 2.75 4.75 13.5h6l-.75 7.75 9-11h-6.25Z" />,
  building: (
    <>
      <path d="M4.75 20.25V5.5a1.75 1.75 0 0 1 1.75-1.75h6a1.75 1.75 0 0 1 1.75 1.75v14.75" />
      <path d="M14.25 10h3.5a1.5 1.5 0 0 1 1.5 1.5v8.75M3.25 20.25h17.5M8 7.5h3M8 11h3M8 14.5h3" />
    </>
  ),
  phone: (
    <>
      <rect x="7.25" y="2.75" width="9.5" height="18.5" rx="2.25" />
      <path d="M10.75 18.25h2.5" />
    </>
  ),
  code: <path d="m9 8.5-4 3.5 4 3.5m6-7 4 3.5-4 3.5m-2.75-9.5-2.5 12" />,
  chart: (
    <>
      <path d="M4.75 19.25h14.5" />
      <path d="M7.5 16V9.75M12 16V5.5M16.5 16v-4.25" />
    </>
  ),
  route: (
    <>
      <circle cx="6" cy="6.5" r="2.5" />
      <circle cx="18" cy="17.5" r="2.5" />
      <path d="M8.5 6.5h5.25a3.25 3.25 0 0 1 0 6.5h-3.5a3.25 3.25 0 0 0 0 6.5H15.5" />
    </>
  ),
  box: (
    <>
      <path d="m12 3.25 8 4.25v9L12 20.75 4 16.5v-9Z" />
      <path d="m4 7.5 8 4.25 8-4.25M12 11.75v9" />
    </>
  ),
  block: (
    <>
      <circle cx="12" cy="12" r="8.25" />
      <path d="m6.75 6.75 10.5 10.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 3.75 2.75 20.25h18.5Z" />
      <path d="M12 9.75v4.5M12 17.25h.01" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.25" />
      <path d="m15.5 15.5 4.75 4.75" />
    </>
  ),
  handshake: (
    <>
      <path d="M3.75 9.5 7 6.25h4.25L13 8l-2 2 1.5 1.5" />
      <path d="M20.25 9.5 17 6.25h-3l-3.5 3.5" />
      <path d="m12.5 11.5 3.25 3.25M10.75 13.25 14 16.5M9 15l2.75 2.75" />
    </>
  ),
};

export type IconName = keyof typeof paths;

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  const path = paths[name];
  if (!path) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}

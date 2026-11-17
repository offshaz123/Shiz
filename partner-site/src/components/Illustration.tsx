/**
 * Flat vector scenes, drawn rather than photographed.
 *
 * There is no stock photography on this site and no licence for any, so the
 * pictures are SVG. That is not purely a constraint: they scale to any screen
 * without a second asset, they cost nothing to load, and they use the six tile
 * tones exactly, which no bought photograph would. If real photography ever
 * arrives, these are self-contained components and swapping one out touches
 * one line.
 *
 * Gradient ids are namespaced per scene ("ms-", "gr-", "pf-") because ids in
 * inline SVG are global to the document. Each scene is designed to appear once
 * per page; rendering the same one twice would have the second instance
 * referencing the first one's gradients, which happens to look identical, but
 * do not rely on it.
 *
 * Every scene is decorative — the surrounding copy carries the meaning — so
 * they are marked aria-hidden and contribute nothing to the accessible name.
 */

type SceneProps = { className?: string };

/** Money leaving here and arriving there: the whole product in one picture. */
function MoneySending({ className = "" }: SceneProps) {
  return (
    <svg viewBox="0 0 420 280" className={className} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="ms-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e2f4f9" />
          <stop offset="100%" stopColor="#f6f2ff" />
        </linearGradient>
        <linearGradient id="ms-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#069ec1" />
          <stop offset="100%" stopColor="#4c6ef5" />
        </linearGradient>
        <linearGradient id="ms-coin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="ms-bank" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0e9f6e" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      <rect width="420" height="280" rx="26" fill="url(#ms-bg)" />

      {/* Confetti, so the corners are not dead space. */}
      <circle cx="52" cy="46" r="5" fill="#8b5cf6" opacity="0.5" />
      <circle cx="372" cy="226" r="6" fill="#069ec1" opacity="0.45" />
      <circle cx="338" cy="48" r="4" fill="#e0537a" opacity="0.5" />
      <rect x="62" y="228" width="10" height="10" rx="3" fill="#4c6ef5" opacity="0.4" />

      {/* The payer's card. */}
      <g transform="rotate(-9 120 150)">
        <rect x="44" y="104" width="152" height="96" rx="16" fill="url(#ms-card)" />
        <rect x="60" y="126" width="26" height="19" rx="4" fill="#ffffff" opacity="0.85" />
        <rect x="60" y="160" width="86" height="8" rx="4" fill="#ffffff" opacity="0.6" />
        <rect x="60" y="176" width="54" height="8" rx="4" fill="#ffffff" opacity="0.38" />
      </g>

      {/* The journey. */}
      <path
        d="M196 120 C 240 66, 300 66, 344 110"
        fill="none"
        stroke="#069ec1"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="9 9"
        opacity="0.75"
      />

      {/* Money in transit. */}
      <g>
        <circle cx="240" cy="83" r="17" fill="url(#ms-coin)" />
        <text x="240" y="90" textAnchor="middle" fontSize="17" fontWeight="700" fill="#ffffff">
          £
        </text>
      </g>
      <g opacity="0.9">
        <circle cx="288" cy="76" r="14" fill="#8b5cf6" />
        <text x="288" y="82" textAnchor="middle" fontSize="14" fontWeight="700" fill="#ffffff">
          $
        </text>
      </g>

      {/* The supplier, receiving. */}
      <g>
        <path d="M296 128 L346 100 L396 128 Z" fill="url(#ms-bank)" />
        <rect x="302" y="128" width="88" height="66" rx="6" fill="url(#ms-bank)" />
        <rect x="316" y="146" width="12" height="34" rx="3" fill="#ffffff" opacity="0.75" />
        <rect x="340" y="146" width="12" height="34" rx="3" fill="#ffffff" opacity="0.75" />
        <rect x="364" y="146" width="12" height="34" rx="3" fill="#ffffff" opacity="0.75" />
        <rect x="296" y="196" width="100" height="10" rx="5" fill="#0e9f6e" />
      </g>

      {/* The receipt, because a payment nobody can see is not finished. */}
      <g>
        <rect x="128" y="206" width="164" height="52" rx="12" fill="#ffffff" />
        <circle cx="154" cy="232" r="13" fill="#0e9f6e" />
        <path
          d="m148 232 4.5 4.5 9-9"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="176" y="222" width="94" height="8" rx="4" fill="#0b1a20" opacity="0.14" />
        <rect x="176" y="238" width="62" height="7" rx="3.5" fill="#0b1a20" opacity="0.09" />
      </g>
    </svg>
  );
}

/** The platform, for the side of the business that sells software. */
function Platform({ className = "" }: SceneProps) {
  return (
    <svg viewBox="0 0 420 280" className={className} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id="pf-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6f2ff" />
          <stop offset="100%" stopColor="#e2f4f9" />
        </linearGradient>
        <linearGradient id="pf-screen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0b1a20" />
          <stop offset="100%" stopColor="#12333f" />
        </linearGradient>
        <linearGradient id="pf-bar" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#069ec1" />
          <stop offset="100%" stopColor="#4c6ef5" />
        </linearGradient>
      </defs>

      <rect width="420" height="280" rx="26" fill="url(#pf-bg)" />

      {/* Desktop back end. */}
      <g>
        <rect x="42" y="50" width="258" height="166" rx="14" fill="url(#pf-screen)" />
        <rect x="42" y="50" width="258" height="26" rx="14" fill="#ffffff" opacity="0.08" />
        <circle cx="60" cy="63" r="4" fill="#e0537a" />
        <circle cx="74" cy="63" r="4" fill="#d97706" />
        <circle cx="88" cy="63" r="4" fill="#0e9f6e" />

        {/* A chart, because that is what an admin back end actually shows. */}
        {[
          { x: 68, h: 44 },
          { x: 104, h: 72 },
          { x: 140, h: 58 },
          { x: 176, h: 92 },
          { x: 212, h: 66 },
        ].map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y={192 - bar.h}
            width="22"
            height={bar.h}
            rx="6"
            fill="url(#pf-bar)"
          />
        ))}
        <rect x="248" y="100" width="36" height="92" rx="8" fill="#ffffff" opacity="0.1" />
        <rect x="68" y="198" width="216" height="6" rx="3" fill="#ffffff" opacity="0.14" />
      </g>

      {/* The phone app, overlapping so the two read as one product. */}
      <g>
        <rect x="264" y="92" width="112" height="162" rx="20" fill="#ffffff" />
        <rect x="274" y="104" width="92" height="138" rx="13" fill="#e2f4f9" />
        <rect x="304" y="98" width="32" height="5" rx="2.5" fill="#0b1a20" opacity="0.18" />
        <rect x="286" y="118" width="68" height="30" rx="8" fill="#069ec1" />
        <rect x="294" y="128" width="30" height="5" rx="2.5" fill="#ffffff" opacity="0.85" />
        <rect x="294" y="138" width="46" height="4" rx="2" fill="#ffffff" opacity="0.5" />
        {[160, 182, 204].map((y) => (
          <g key={y}>
            <circle cx="298" cy={y + 8} r="8" fill="#8b5cf6" opacity="0.25" />
            <rect x="314" y={y + 4} width="42" height="5" rx="2.5" fill="#0b1a20" opacity="0.16" />
            <rect x="314" y={y + 13} width="26" height="4" rx="2" fill="#0b1a20" opacity="0.09" />
          </g>
        ))}
      </g>
    </svg>
  );
}

const scenes = {
  "money-sending": MoneySending,
  platform: Platform,
} as const;

export type IllustrationName = keyof typeof scenes;

export function Illustration({
  name,
  className = "",
}: {
  name: IllustrationName;
  className?: string;
}) {
  const Scene = scenes[name];
  return <Scene className={className} />;
}

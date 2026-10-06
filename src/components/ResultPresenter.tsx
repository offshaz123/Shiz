/**
 * Flat-illustrated figure standing behind the hero result card, holding it up
 * like a board.
 *
 * Drawn in two layers that share one viewBox so they line up at any size: the
 * head, hair, shoulders and arms render behind the card, and the hands render
 * in front of it, so the card reads as something she is actually gripping. The
 * caller gives both layers the same width and offset.
 *
 * Geometry note: the caller positions the board's top edge at y=150 in this
 * viewBox. Anything above that line is visible; anything below is hidden behind
 * the board. The arms therefore sit just above 150, and the hands straddle it —
 * backs of the hands above the line, fingers curling down over the front.
 *
 * Deliberately an illustration rather than a photograph. The numbers on the
 * card beside it are a real client's published results, and a stock photo of a
 * real person next to them would imply they were that client or one of our team.
 */

const SKIN = "#f0c3a0";
const SKIN_SHADE = "#e0ad88";
const HAIR = "#2a2140";
const HAIR_LIGHT = "#3d3062";

/** Head, hair, shoulders and the arms reaching out. Renders behind the board. */
export function PresenterBody({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient
          id="presenter-blazer"
          x1="70"
          y1="120"
          x2="230"
          y2="215"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#7b2ff7" />
          <stop offset="1" stopColor="#e0218a" />
        </linearGradient>
      </defs>

      {/* Hair, back layer — falls to the shoulders behind the face */}
      <path
        d="M108 114c-9-15-9-39 1-55 10-17 25-27 41-27s31 10 41 27c10 16 10 40 1 55 2 17 1 31-3 42-6-6-9-16-11-27-11 8-21 11-28 11s-17-3-28-11c-2 11-5 21-11 27-4-11-5-25-3-42Z"
        fill={HAIR}
      />

      {/* Neck */}
      <path d="M137 96h26v30h-26z" fill={SKIN_SHADE} />

      {/* Arms, reaching out along the top of the board to where the hands grip.
          Kept just above y=150 so they stay visible rather than vanishing. */}
      <path
        d="M122 146c-14-6-30-8-50-4"
        stroke={SKIN}
        strokeWidth="17"
        strokeLinecap="round"
      />
      <path
        d="M178 146c14-6 30-8 50-4"
        stroke={SKIN}
        strokeWidth="17"
        strokeLinecap="round"
      />

      {/* Shoulders and torso, blazer in the brand gradient */}
      <path
        d="M150 118c-19 0-33 6-43 14-13 11-21 27-25 48-1 6 3 11 9 11h118c6 0 10-5 9-11-4-21-12-37-25-48-10-8-24-14-43-14Z"
        fill="url(#presenter-blazer)"
      />
      {/* Open collar */}
      <path
        d="M137 120c4 10 8 17 13 21 5-4 9-11 13-21-4-1-8-2-13-2s-9 1-13 2Z"
        fill="#ffffff"
        opacity="0.92"
      />

      {/* Face */}
      <ellipse cx="150" cy="70" rx="32" ry="36" fill={SKIN} />

      {/* Fringe sweeping across the forehead */}
      <path
        d="M118 66c-2-23 13-40 32-40s34 15 32 38c-8-11-17-17-28-17-13 0-23 8-36 19Z"
        fill={HAIR_LIGHT}
      />

      {/* Features — a light touch, so they still read at small sizes */}
      <circle cx="138" cy="72" r="2.8" fill={HAIR} />
      <circle cx="162" cy="72" r="2.8" fill={HAIR} />
      <path
        d="M143 85c3 3 5 4 7 4s4-1 7-4"
        stroke={HAIR}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** One hand gripping the board's top edge: back of the hand above the line at
 *  y=150, four fingers curling down over the front of the board below it. */
function Hand({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 0)`}>
      {/* Back of the hand, sitting on top of the edge */}
      <rect x="-21" y="132" width="42" height="20" rx="9" fill={SKIN} />
      {/* Fingers hooked down over the front face */}
      {[-16, -6, 4, 14].map((fx) => (
        <rect key={fx} x={fx} y="146" width="8" height="19" rx="4" fill={SKIN} />
      ))}
      {/* A shade line where the fingers meet the hand, so they read separately */}
      <rect x="-21" y="148" width="42" height="2.5" fill={SKIN_SHADE} opacity="0.55" />
    </g>
  );
}

/**
 * Just the two hands, at the ends of the arms above. Same viewBox as the body,
 * so stacking the two layers at the same position lines the hands up with the
 * wrists — this one renders in front of the board.
 */
export function PresenterHands({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 300 220" fill="none" aria-hidden="true" className={className}>
      <Hand x={72} />
      <Hand x={228} />
    </svg>
  );
}

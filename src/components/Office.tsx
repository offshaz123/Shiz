"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Doing, Office as OfficeData, Worker } from "@/lib/office";
import { REGIONS, REGION_INFO, type Region } from "@/lib/regions";

/**
 * The automatic jobs, drawn as a room with people in it.
 *
 * Everything on screen is decided by what the job behind it is really
 * doing: the one sitting with its head down is the one that has
 * stopped, and pressing it says why. The drawing is the interesting
 * part, but the point is that it cannot flatter the system — a figure
 * typing away over a job that has not run for a week would make this
 * the thing you check instead of checking.
 */

/**
 * Where each desk sits: two rows of seven, columns lined up.
 *
 * Laid out from the figure's feet rather than the desk, because the
 * name tag floats 72 above the head and that is what collides with
 * things. The first version put the back row at 250 and "SHAZ
 * MARKETING" came out with a desk through the middle of it.
 *
 * Deliberately a plain grid. A scattered, organic-looking office was
 * the first instinct and it read as clutter the moment there were more
 * than eight of them — and clutter is the opposite of the thing this
 * page is for, which is seeing at a glance who has stopped.
 */
const ROOM = { w: 1400, h: 830, wall: 300 };

const DESKS: { x: number; y: number; facing: 1 | -1 }[] = [
  ...[120, 310, 500, 690, 880, 1070, 1260].map((x) => ({
    x,
    y: 382,
    facing: (x > 700 ? -1 : 1) as 1 | -1,
  })),
  ...[120, 310, 500, 690, 880, 1070, 1260].map((x) => ({
    x,
    y: 566,
    facing: (x > 700 ? -1 : 1) as 1 | -1,
  })),
];

// Enough of each that fourteen people in a grid do not come out as
// two rows of the same seven. Walked through in step, so the pairings
// are stable: the same job is the same person every time you look.
const SKIN = [
  "#e8b48c", "#c98e63", "#8d5a3b", "#f0c9a4", "#a9714a",
  "#d9a57c", "#7a4a30", "#efc7a2", "#b57c52", "#96603c",
  "#e3ab80", "#c4a07a", "#dcb18d", "#8a5636",
];

const SHIRT = [
  "#ec4899", "#6366f1", "#14b8a6", "#f59e0b", "#8b5cf6",
  "#0ea5e9", "#22c55e", "#f43f5e", "#a855f7", "#06b6d4",
  "#eab308", "#10b981", "#3b82f6", "#fb7185",
];

/** What the figure is doing, in words, for anyone who cannot see it. */
const DOING_WORDS: Record<Doing, string> = {
  working: "at the desk, working",
  talking: "standing up, trying to tell you something",
  walking: "up and about, nothing waiting",
  eating: "having a break",
  asleep: "head down — this one has stopped",
};

function Person({
  worker,
  index,
  selected,
}: {
  worker: Worker;
  index: number;
  selected: boolean;
}) {
  const skin = SKIN[index % SKIN.length];
  const shirt = SHIRT[index % SHIRT.length];
  const { doing } = worker;

  return (
    <g className={`office-person office-${doing}`}>
      {/* Chair back, behind the body. */}
      <rect x={-20} y={-8} width={40} height={46} rx={8} fill="#1f2937" opacity={0.9} />

      {/* Body. */}
      <path
        d="M -22 40 q 0 -32 22 -32 q 22 0 22 32 z"
        fill={shirt}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth={1}
      />

      {/* Arms. The typing one bobs; the talking one is raised. */}
      <g className="office-arm office-arm-left">
        <rect x={-30} y={6} width={13} height={26} rx={6} fill={shirt} />
        <circle cx={-23} cy={33} r={6} fill={skin} />
      </g>
      <g className="office-arm office-arm-right">
        <rect x={17} y={6} width={13} height={26} rx={6} fill={shirt} />
        <circle cx={23} cy={33} r={6} fill={skin} />
      </g>

      {/* Head. */}
      <g className="office-head">
        <circle cx={0} cy={-14} r={17} fill={skin} />
        {/* Hair, varied by index so seven people are not septuplets. */}
        {index % 3 === 0 && <path d="M -17 -18 q 17 -20 34 0 q -17 -9 -34 0 z" fill="#1f2937" />}
        {index % 3 === 1 && <path d="M -17 -16 q 4 -20 34 -4 q -6 -12 -34 4 z" fill="#4b2e1e" />}
        {index % 3 === 2 && <path d="M -18 -14 q 2 -24 36 -6 l -2 8 q -14 -12 -34 -2 z" fill="#111827" />}

        {/* Eyes: open, or closed when this one has stopped. */}
        {doing === "asleep" ? (
          <>
            <path d="M -9 -14 q 4 4 8 0" stroke="#1f2937" strokeWidth={2} fill="none" strokeLinecap="round" />
            <path d="M 1 -14 q 4 4 8 0" stroke="#1f2937" strokeWidth={2} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={-5} cy={-16} r={2.4} fill="#111827" />
            <circle cx={5} cy={-16} r={2.4} fill="#111827" />
          </>
        )}
        <path
          d={doing === "asleep" ? "M -5 -5 q 5 -3 10 0" : "M -5 -6 q 5 5 10 0"}
          stroke="#111827"
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* A mug for the one on a break. */}
      {doing === "eating" && (
        <g className="office-mug">
          <rect x={14} y={14} width={14} height={13} rx={3} fill="#f3f4f6" />
          <path d="M 28 18 q 7 3 0 7" stroke="#f3f4f6" strokeWidth={2.5} fill="none" />
          <path className="office-steam" d="M 21 10 q 4 -5 0 -10" stroke="#9ca3af" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Sleeping marks, which are the room's way of saying "this is broken". */}
      {doing === "asleep" && (
        <g className="office-zzz" fill="#94a3b8" fontSize={14} fontWeight={700}>
          <text x={24} y={-14}>z</text>
          <text x={34} y={-26}>z</text>
        </g>
      )}

      {/* The ring that shows which one is open. */}
      {selected && (
        <circle cx={0} cy={6} r={46} fill="none" stroke="var(--brand-pink, #ec4899)" strokeWidth={2.5} />
      )}
    </g>
  );
}

function Desk({ facing }: { facing: 1 | -1 }) {
  return (
    <g>
      <rect x={-62} y={38} width={124} height={13} rx={4} fill="#374151" />
      <rect x={-56} y={51} width={8} height={26} fill="#1f2937" />
      <rect x={48} y={51} width={8} height={26} fill="#1f2937" />
      {/* A screen, turned so you can tell which way the desk faces. */}
      <g transform={`translate(${facing * 30} 0)`}>
        <rect x={-18} y={10} width={36} height={25} rx={3} fill="#111827" stroke="#4b5563" />
        <rect className="office-screen" x={-14} y={14} width={28} height={17} rx={2} fill="#1e3a5f" />
        <rect x={-4} y={35} width={8} height={5} fill="#4b5563" />
      </g>
    </g>
  );
}

export function Office({ office }: { office: OfficeData }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const router = useRouter();
  const path = usePathname();

  // The country lives in the address rather than in this component's
  // state. The overview page learnt that one the hard way: pressing
  // United States there once changed the tiles and left every figure
  // underneath British, because only half the page knew.
  const go = (r?: Region) => router.push(r ? `${path}?region=${r}` : path);

  // Actually live, not a picture of a minute ago.
  //
  // Every figure here is drawn from a number read when the page was
  // built, so without this the room would freeze the moment you opened
  // it — and a job that stopped at four o'clock would still be happily
  // typing at six. A minute is often enough for work measured in hours
  // and cheap enough to leave open on a second screen all day.
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  useEffect(() => {
    const timer = setInterval(() => {
      router.refresh();
      setRefreshedAt(new Date());
    }, 60_000);
    return () => clearInterval(timer);
  }, [router]);
  const open = office.workers.find((w) => w.id === openId) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => go(undefined)}
          className={`rounded-xl border px-3.5 py-2 text-sm font-semibold ${
            office.region === undefined
              ? "border-brand-pink text-foreground"
              : "border-border text-muted hover:text-foreground"
          }`}
        >
          Both
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => go(r)}
            className={`rounded-xl border px-3.5 py-2 text-sm font-semibold ${
              office.region === r
                ? "border-brand-pink text-foreground"
                : "border-border text-muted hover:text-foreground"
            }`}
          >
            {REGION_INFO[r].name}
          </button>
        ))}
        <p className="ml-1 text-xs text-muted">{office.summary}</p>
        <p className="ml-auto text-[11px] text-muted">
          {refreshedAt
            ? `Checked again at ${refreshedAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
            : "Checks itself every minute"}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-[#0b1120]">
        <svg
          viewBox={`0 0 ${ROOM.w} ${ROOM.h}`}
          className="h-auto w-full"
          role="img"
          aria-label={`The automatic jobs as an office. ${office.workers
            .map((w) => `${w.name}, ${w.title}, ${DOING_WORDS[w.doing]}`)
            .join(". ")}`}
        >
          {/* Back wall and floor. */}
          <rect x={0} y={0} width={ROOM.w} height={ROOM.wall} fill="#111827" />
          <rect x={0} y={ROOM.wall} width={ROOM.w} height={ROOM.h - ROOM.wall} fill="#0f172a" />
          <line x1={0} y1={ROOM.wall} x2={ROOM.w} y2={ROOM.wall} stroke="#1f2937" strokeWidth={3} />

          {/* Windows, with a night sky, because this lot work while nobody is in. */}
          {[40, 228].map((x) => (
            <g key={x}>
              <rect x={x} y={28} width={158} height={96} rx={6} fill="#0c4a6e" opacity={0.65} />
              <rect x={x} y={28} width={158} height={96} rx={6} fill="none" stroke="#334155" strokeWidth={4} />
              <line x1={x + 79} y1={28} x2={x + 79} y2={124} stroke="#334155" strokeWidth={4} />
              <circle cx={x + 120} cy={54} r={8} fill="#e2e8f0" opacity={0.7} />
            </g>
          ))}

          {/* The name on the wall, and what the room is for.
              Walid asked for both, and the goal in his own words: make
              money, fast, before it is too late. It sits above every
              desk because it is the thing all of them are for. */}
          <g>
            <text x={40} y={206} fill="#f8fafc" fontSize={42} fontWeight={800} letterSpacing="2">
              SHAZ
            </text>
            <text
              x={153}
              y={206}
              fill="var(--brand-pink, #ec4899)"
              fontSize={42}
              fontWeight={800}
              letterSpacing="2"
            >
              MARKETING
            </text>
            <rect x={40} y={220} width={470} height={3} rx={1.5} fill="var(--brand-pink, #ec4899)" opacity={0.8} />
            <text x={40} y={254} fill="#94a3b8" fontSize={16} fontWeight={700} letterSpacing="0.5">
              THE GOAL — MAKE MONEY, FAST. BEFORE IT&apos;S TOO LATE.
            </text>
          </g>

          {/* A clock, because the whole point of this lot is the hours
              nobody is in to work them. */}
          <g transform="translate(610 180)">
            <circle r={30} fill="#1e293b" stroke="#334155" strokeWidth={3} />
            <line x1={0} y1={0} x2={0} y2={-17} stroke="#e2e8f0" strokeWidth={3} strokeLinecap="round" />
            <line x1={0} y1={0} x2={12} y2={7} stroke="#94a3b8" strokeWidth={2.5} strokeLinecap="round" />
            <circle r={2.5} fill="#ec4899" />
          </g>

          {/* The screen on the wall.
              Walid asked for "a projector type thing that shows what
              the employee is doing", and it replaced two static boards
              that said the same thing in less space. Nothing is
              selected to begin with, so it shows the room: how many
              businesses are on the list and how many of this lot are
              still standing. Press anybody and it becomes about them. */}
          <g>
            {/* The projector itself, hanging off the ceiling. */}
            <g transform="translate(1030 286)">
              <rect x={-26} y={-22} width={52} height={22} rx={5} fill="#334155" />
              <rect x={-5} y={-30} width={10} height={8} fill="#1e293b" />
              <circle cx={-22} cy={-11} r={4} fill="#fcd34d" opacity={0.9} />
            </g>
            {/* Its light, which is why the screen is brighter than the wall. */}
            <path d="M 1008 272 L 706 262 L 706 60 L 1006 264 Z" fill="#fcd34d" opacity={0.05} />

            <rect x={700} y={30} width={660} height={232} rx={10} fill="#0b1220" stroke="#334155" strokeWidth={3} />
            <rect x={700} y={30} width={660} height={232} rx={10} fill="#38bdf8" opacity={0.045} />

            {/* The little red light, so the thing reads as switched on. */}
            <circle className="office-live-dot" cx={1336} cy={52} r={5} fill="#ef4444" />

            {open ? (
              <>
                <text x={726} y={74} fill="#94a3b8" fontSize={15} fontWeight={700} letterSpacing="1">
                  NOW SHOWING
                </text>
                <text x={726} y={124} fill="#f8fafc" fontSize={38} fontWeight={800}>
                  {open.name}
                </text>
                <text x={726} y={154} fill="var(--brand-pink, #ec4899)" fontSize={18} fontWeight={700}>
                  {open.title}
                </text>
                <text x={726} y={198} fill="#f8fafc" fontSize={30} fontWeight={800}>
                  {open.value === null ? "—" : open.value.toLocaleString("en-GB")}
                  <tspan fill="#94a3b8" fontSize={15} fontWeight={600}>
                    {"  "}
                    {open.unit}
                  </tspan>
                </text>
                <text
                  x={726}
                  y={236}
                  fill={open.live ? "#4ade80" : "#f87171"}
                  fontSize={16}
                  fontWeight={700}
                >
                  {open.says.length > 54 ? `${open.says.slice(0, 53)}…` : open.says}
                </text>
              </>
            ) : (
              <>
                <text x={726} y={74} fill="#94a3b8" fontSize={15} fontWeight={700} letterSpacing="1">
                  {office.region ? REGION_INFO[office.region].name.toUpperCase() : "BOTH COUNTRIES"}
                </text>
                <text x={726} y={136} fill="#f8fafc" fontSize={44} fontWeight={800}>
                  {(office.workers.find((w) => w.id === "finder")?.value ?? 0).toLocaleString("en-GB")}
                  <tspan fill="#94a3b8" fontSize={17} fontWeight={600}>
                    {"  "}businesses on the list
                  </tspan>
                </text>
                <text
                  x={726}
                  y={192}
                  fill={office.workers.some((w) => w.doing === "asleep") ? "#f87171" : "#4ade80"}
                  fontSize={44}
                  fontWeight={800}
                >
                  {office.workers.filter((w) => w.doing !== "asleep").length}
                  <tspan fill="#94a3b8" fontSize={20}>
                    /{office.workers.length}
                  </tspan>
                  <tspan fill="#94a3b8" fontSize={17} fontWeight={600}>
                    {"  "}jobs still running
                  </tspan>
                </text>
                <text x={726} y={234} fill="#64748b" fontSize={15}>
                  Press anybody to put them on the screen
                </text>
              </>
            )}
          </g>

          {/* A water cooler and a plant, so the floor reads as a room
              rather than as a chart with people drawn on it. */}
          <g transform={`translate(${ROOM.w - 42} ${ROOM.wall + 4})`}>
            <rect x={-16} y={-70} width={32} height={44} rx={5} fill="#38bdf8" opacity={0.45} />
            <rect x={-19} y={-28} width={38} height={30} rx={4} fill="#475569" />
          </g>
          <g transform="translate(486 766)">
            <ellipse cx={0} cy={10} rx={30} ry={7} fill="#000" opacity={0.3} />
            <rect x={-20} y={-30} width={40} height={38} rx={5} fill="#7c2d12" />
            <path d="M 0 -30 q -34 -24 -18 -58 q 18 14 18 58" fill="#15803d" />
            <path d="M 0 -30 q 34 -24 18 -58 q -18 14 -18 58" fill="#16a34a" />
            <path d="M 0 -30 q -6 -34 4 -52 q 6 24 -4 52" fill="#22c55e" />
          </g>

          {/* A seam across the floor between the two rows. A rug was the
              first attempt and at this size it read as a stain. */}
          <line x1={0} y1={474} x2={ROOM.w} y2={474} stroke="#162032" strokeWidth={2} />

          {office.workers.map((worker, i) => {
            const desk = DESKS[i % DESKS.length];
            return (
              <g
                key={worker.id}
                transform={`translate(${desk.x} ${desk.y})`}
                onClick={() => setOpenId(openId === worker.id ? null : worker.id)}
                className="cursor-pointer"
                tabIndex={0}
                role="button"
                aria-label={`${worker.name}, ${worker.title}. ${worker.says}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setOpenId(openId === worker.id ? null : worker.id);
                  }
                }}
              >
                <ellipse cx={0} cy={78} rx={54} ry={9} fill="#000" opacity={0.35} />
                <Desk facing={desk.facing} />
                <Person worker={worker} index={i} selected={openId === worker.id} />

                {/* The name tag over their head. */}
                <g transform="translate(0 -52)">
                  <rect
                    x={-62}
                    y={-20}
                    width={124}
                    height={34}
                    rx={9}
                    fill="#0f172a"
                    stroke={worker.doing === "asleep" ? "#ef4444" : "#334155"}
                    strokeWidth={2}
                  />
                  <text x={0} y={-6} textAnchor="middle" fill="#f8fafc" fontSize={14} fontWeight={800}>
                    {worker.name}
                  </text>
                  <text x={0} y={8} textAnchor="middle" fill="#94a3b8" fontSize={10.5}>
                    {worker.title}
                  </text>
                </g>

                {/* What they are saying, when they have something to
                    say. Centred above the name tag rather than beside
                    the figure: the desks are 190 apart and a bubble
                    wide enough to read was landing across whoever sat
                    next to them. */}
                {worker.doing === "talking" && (
                  <g className="office-bubble" transform="translate(0 -108)">
                    <rect x={-88} y={-17} width={176} height={34} rx={10} fill="#fef3c7" />
                    <path d="M -8 17 l 8 12 l 8 -12 z" fill="#fef3c7" />
                    <text x={0} y={5} textAnchor="middle" fill="#78350f" fontSize={11} fontWeight={700}>
                      {worker.says.length > 30 ? `${worker.says.slice(0, 29)}…` : worker.says}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* The front of the room, nearest the viewer: the bit of an
              office that is not desks. The floor below the second row
              was a plain slab and the whole thing read as a seating
              plan rather than a place. */}

          {/* A sofa and a low table. */}
          <g transform="translate(150 712)">
            <rect x={-104} y={-34} width={208} height={40} rx={14} fill="#334155" />
            <rect x={-96} y={-14} width={192} height={38} rx={12} fill="#475569" />
            <rect x={-88} y={-20} width={82} height={26} rx={9} fill="#3f4e63" />
            <rect x={6} y={-20} width={82} height={26} rx={9} fill="#3f4e63" />
            <rect x={-100} y={24} width={14} height={14} rx={3} fill="#1e293b" />
            <rect x={86} y={24} width={14} height={14} rx={3} fill="#1e293b" />
          </g>
          <g transform="translate(330 740)">
            <ellipse cx={0} cy={26} rx={56} ry={9} fill="#000" opacity={0.3} />
            <rect x={-54} y={-8} width={108} height={12} rx={4} fill="#475569" />
            <rect x={-46} y={4} width={7} height={20} fill="#334155" />
            <rect x={39} y={4} width={7} height={20} fill="#334155" />
            <rect x={-26} y={-18} width={13} height={11} rx={2.5} fill="#f1f5f9" />
            <rect x={6} y={-18} width={13} height={11} rx={2.5} fill="#f1f5f9" />
          </g>

          {/* A meeting table, with chairs nobody is sitting on, because
              this lot do not have meetings. */}
          <g transform="translate(700 726)">
            <ellipse cx={0} cy={40} rx={168} ry={16} fill="#000" opacity={0.3} />
            <rect x={-150} y={-10} width={300} height={18} rx={7} fill="#52627a" />
            <rect x={-132} y={8} width={12} height={32} fill="#334155" />
            <rect x={120} y={8} width={12} height={32} fill="#334155" />
            {[-96, -32, 32, 96].map((x) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <rect x={-17} y={-40} width={34} height={30} rx={7} fill="#3f4e63" />
                <rect x={-15} y={10} width={30} height={9} rx={4} fill="#3f4e63" />
              </g>
            ))}
            <rect x={-30} y={-24} width={60} height={14} rx={3} fill="#1e293b" />
            <rect x={-24} y={-21} width={48} height={8} rx={2} fill="#2a5584" />
          </g>

          {/* A printer that is always out of paper, a cabinet, a bin. */}
          <g transform="translate(1130 724)">
            <ellipse cx={0} cy={44} rx={56} ry={10} fill="#000" opacity={0.3} />
            <rect x={-46} y={-26} width={92} height={70} rx={8} fill="#475569" />
            <rect x={-34} y={-38} width={68} height={14} rx={4} fill="#334155" />
            <rect x={-38} y={-6} width={76} height={10} rx={3} fill="#1e293b" />
            <rect x={-26} y={10} width={52} height={22} rx={3} fill="#f1f5f9" opacity={0.9} />
            <circle cx={34} cy={-14} r={4} fill="#4ade80" />
          </g>
          <g transform="translate(1272 716)">
            <ellipse cx={0} cy={52} rx={48} ry={10} fill="#000" opacity={0.3} />
            <rect x={-40} y={-34} width={80} height={86} rx={6} fill="#3f4e63" />
            {[-20, 6, 32].map((y) => (
              <g key={y}>
                <rect x={-34} y={y} width={68} height={20} rx={3} fill="#475569" />
                <rect x={-8} y={y + 8} width={16} height={4} rx={2} fill="#1e293b" />
              </g>
            ))}
          </g>
          <g transform="translate(1352 756)">
            <path d="M -14 -22 l 28 0 l -4 34 l -20 0 z" fill="#334155" />
            <rect x={-16} y={-26} width={32} height={6} rx={3} fill="#475569" />
          </g>

        </svg>
      </div>

      {/* What the one you pressed is actually doing. Real figures, counted
          from the database — the drawing is decoration, this is the part
          you would act on. */}
      {open ? (
        <div className="rounded-2xl border border-brand-pink/40 bg-surface p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {open.name} <span className="text-sm font-semibold text-muted">— {open.title}</span>
              </h2>
              <p className="mt-1 text-sm text-muted">{open.does}</p>
            </div>
            <button
              type="button"
              onClick={() => setOpenId(null)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-muted hover:text-foreground"
            >
              Close
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-6">
            {open.value !== null && (
              <p className="text-foreground">
                <span className="text-3xl font-extrabold">{open.value.toLocaleString("en-GB")}</span>{" "}
                <span className="text-xs text-muted">{open.unit}</span>
              </p>
            )}
            <p className="text-sm">
              <span className="text-muted">Right now: </span>
              <span
                className={`font-semibold ${open.live ? "text-foreground" : "text-red-400"}`}
              >
                {open.says}
              </span>
            </p>
            {open.href && (
              <Link
                href={open.href}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-brand-pink"
              >
                See the work →
              </Link>
            )}
          </div>

          <p className="mt-3 text-[11px] text-muted">{DOING_WORDS[open.doing]}</p>
        </div>
      ) : (
        <p className="text-xs text-muted">
          Press anybody to see what they have done and whether they are still doing it. Every number
          on this page is counted from the database — nobody here is acting.
        </p>
      )}
    </div>
  );
}

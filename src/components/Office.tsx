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
const ROOM = { w: 1880, h: 940, wall: 300 };

/** Where the room ends and the bunk room begins. */
const PARTITION = 1390;

const DESKS: { x: number; y: number }[] = [
  // Front row first, because the list arrives busiest first and Walid
  // wanted whoever handles the most sitting at the front.
  // The two rows are 218 apart rather than touching, because a front-row
  // speech bubble floats 108 above its figure and at 184 apart it landed
  // on the desk of whoever sat behind them.
  ...[120, 310, 500, 690, 880, 1070, 1260].map((x) => ({ x, y: 584 })),
  ...[120, 310, 500, 690, 880, 1070, 1260].map((x) => ({ x, y: 366 })),
];

/**
 * Which desk the nth person on the floor gets.
 *
 * The desks are listed front row first, so filling them in order put
 * everybody at the front and left two people alone at the back of an
 * empty room. This splits whoever is in across the two rows, keeping
 * the busier half at the front, so the room looks occupied however
 * many of them are running.
 */
function deskFor(index: number, total: number): number {
  const perRow = Math.ceil(Math.min(total, 14) / 2);
  const row = index < perRow ? 0 : 1;
  const place = index < perRow ? index : index - perRow;
  return row * 7 + place;
}

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
  resting: "resting — running fine, nothing to do until its next turn",
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
  const trousers = ["#1e293b", "#312e81", "#374151", "#3f3f46"][index % 4];
  const { doing } = worker;
  const shut = doing === "asleep" || doing === "resting";

  return (
    <g className={`office-person office-${doing}`}>
      {/* The chair, behind everything. */}
      <rect x={-24} y={-14} width={48} height={52} rx={9} fill="#1f2937" />
      <rect x={-26} y={40} width={52} height={10} rx={4} fill="#111827" />

      {/* Legs. Drawn before the desk, so the thighs go behind the top
          and the shins and feet show underneath it — which is what
          makes them look seated at it rather than standing in front. */}
      {[-13, 13].map((x) => (
        <g key={x}>
          <rect x={x - 9} y={28} width={18} height={26} rx={7} fill={trousers} />
          <rect x={x - 8} y={48} width={16} height={32} rx={7} fill={trousers} />
          <ellipse cx={x} cy={82} rx={11} ry={6} fill="#0f172a" />
        </g>
      ))}

      {/* Body: shoulders down to the waist. */}
      <path
        d="M -21 -6 q 0 -10 10 -11 h 22 q 10 1 10 11 l 3 38 h -48 z"
        fill={shirt}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth={1}
      />
      <rect x={-6} y={-20} width={12} height={12} rx={4} fill={skin} />

      {/* Arms, each with an upper arm, a forearm and a hand. The
          forearm is what the typing animation moves. */}
      <g className="office-arm office-arm-left">
        <rect x={-30} y={-4} width={13} height={22} rx={6} fill={shirt} />
        <rect x={-30} y={14} width={12} height={20} rx={6} fill={shirt} />
        <circle cx={-24} cy={35} r={6.5} fill={skin} />
      </g>
      <g className="office-arm office-arm-right">
        <rect x={17} y={-4} width={13} height={22} rx={6} fill={shirt} />
        <rect x={18} y={14} width={12} height={20} rx={6} fill={shirt} />
        <circle cx={24} cy={35} r={6.5} fill={skin} />
      </g>

      {/* Head. */}
      <g className="office-head">
        <circle cx={0} cy={-36} r={20} fill={skin} />
        {/* Ears, which is most of what stops a circle reading as a ball. */}
        <circle cx={-19} cy={-34} r={4.5} fill={skin} />
        <circle cx={19} cy={-34} r={4.5} fill={skin} />
        {index % 3 === 0 && <path d="M -20 -42 q 20 -22 40 0 q -20 -10 -40 0 z" fill="#1f2937" />}
        {index % 3 === 1 && <path d="M -20 -40 q 5 -23 40 -5 q -7 -14 -40 5 z" fill="#4b2e1e" />}
        {index % 3 === 2 && <path d="M -21 -38 q 2 -27 42 -7 l -2 9 q -16 -14 -40 -2 z" fill="#111827" />}

        {shut ? (
          <>
            <path d="M -12 -36 q 5 6 10 0" stroke="#1f2937" strokeWidth={2.8} fill="none" strokeLinecap="round" />
            <path d="M 2 -36 q 5 6 10 0" stroke="#1f2937" strokeWidth={2.8} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <circle cx={-7} cy={-38} r={3.4} fill="#111827" />
            <circle cx={7} cy={-38} r={3.4} fill="#111827" />
          </>
        )}
        {/* A rest is a contented thing and a stoppage is not, so the
            resting one keeps its smile and only the stopped one loses it. */}
        <path
          d={doing === "asleep" ? "M -8 -26 q 8 -4 16 0" : "M -8 -27 q 8 8 16 0"}
          stroke="#111827"
          strokeWidth={2.6}
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* A mug for the one on a break. */}
      {doing === "eating" && (
        <g className="office-mug">
          <rect x={16} y={16} width={14} height={13} rx={3} fill="#f3f4f6" />
          <path d="M 30 20 q 7 3 0 7" stroke="#f3f4f6" strokeWidth={2.5} fill="none" />
          <path className="office-steam" d="M 23 12 q 4 -5 0 -10" stroke="#9ca3af" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      )}

      {/* Both have their eyes shut, so the marks carry the difference:
          red for a job that has stopped, faint blue for one that is
          simply resting until its next turn. */}
      {shut && (
        <g
          className="office-zzz"
          fill={doing === "asleep" ? "#f87171" : "#60a5fa"}
          opacity={doing === "asleep" ? 1 : 0.75}
          fontSize={14}
          fontWeight={700}
        >
          <text x={24} y={-34}>z</text>
          <text x={34} y={-46}>z</text>
        </g>
      )}

      {selected && (
        <circle cx={0} cy={-2} r={54} fill="none" stroke="var(--brand-pink, #ec4899)" strokeWidth={2.5} />
      )}
    </g>
  );
}

function Desk() {
  return (
    <g>
      <rect x={-62} y={38} width={124} height={13} rx={4} fill="#374151" />
      <rect x={-56} y={51} width={8} height={26} fill="#1f2937" />
      <rect x={48} y={51} width={8} height={26} fill="#1f2937" />
    </g>
  );
}

/**
 * The laptop, drawn after the figure so it stands in front of them.
 *
 * It was a monitor off to one side at first, which left everybody
 * apparently sitting at an empty desk looking sideways. One open
 * laptop in front of each person is what an office actually looks
 * like, and it reads at this size — the lid hides the bottom of the
 * body, which is what makes them look seated rather than pasted on.
 */
function Laptop() {
  return (
    <g>
      {/* The lid. */}
      <path d="M -23 10 h 46 a 3 3 0 0 1 3 3 v 20 h -52 v -20 a 3 3 0 0 1 3 -3 z" fill="#111827" />
      <rect className="office-screen" x={-19} y={13} width={38} height={17} rx={2} fill="#1e3a5f" />
      {/* The keyboard deck, in a little perspective. */}
      <path d="M -26 33 h 52 l 7 7 h -66 z" fill="#4b5563" />
      <path d="M -19 35 h 38 l 2 3 h -42 z" fill="#374151" />
    </g>
  );
}


/**
 * A bunk, and whoever is asleep in it.
 *
 * The jobs that have stopped used to be drawn slumped at their own
 * desks, which read as somebody having a nap at work rather than as a
 * thing that is switched off. In a bed, in a room of their own, with
 * the door marked, it is obvious at a glance which jobs are not
 * running — and that is the only thing this page is really for.
 *
 * They are still as clickable as anybody at a desk: pressing one says
 * why it stopped.
 */
function Bunk({
  worker,
  selected,
  onPick,
  index,
}: {
  worker: Worker;
  selected: boolean;
  onPick: () => void;
  index: number;
}) {
  const skin = SKIN[index % SKIN.length];

  return (
    <g
      className="office-desk cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-pink,#ec4899)]"
      onClick={onPick}
      tabIndex={0}
      role="button"
      aria-label={`${worker.name}, ${worker.title}, asleep. ${worker.says}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPick();
        }
      }}
    >
      {/* The mattress. */}
      <rect x={-96} y={-18} width={192} height={28} rx={7} fill="#1e293b" />
      <rect x={-96} y={-26} width={192} height={12} rx={5} fill="#334155" />

      {/* Pillow and whoever is on it. */}
      <rect x={-88} y={-40} width={44} height={22} rx={7} fill="#e2e8f0" opacity={0.85} />
      <g className="office-sleeper">
        <circle cx={-66} cy={-32} r={14} fill={skin} />
        <path d="M -80 -36 q 14 -16 28 -2 q -14 -7 -28 2 z" fill="#1f2937" />
        <path d="M -73 -32 q 3 3 6 0" stroke="#1f2937" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <path d="M -65 -32 q 3 3 6 0" stroke="#1f2937" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {/* The blanket, pulled up. */}
        <path d="M -48 -20 h 140 a 6 6 0 0 1 6 6 v 16 h -146 z" fill="#be185d" opacity={0.75} />
        <rect x={-50} y={-24} width={18} height={8} rx={4} fill="#e2e8f0" opacity={0.6} />
      </g>

      <g className="office-zzz" fill="#f87171" fontSize={15} fontWeight={700}>
        <text x={-44} y={-44}>z</text>
        <text x={-32} y={-58}>z</text>
      </g>

      {/* Who it is, on the end of the bed. */}
      <g transform="translate(0 30)">
        <rect
          x={-92}
          y={-13}
          width={184}
          height={30}
          rx={8}
          fill="#0f172a"
          stroke={selected ? "var(--brand-pink, #ec4899)" : "#7f1d1d"}
          strokeWidth={2}
        />
        <text x={0} y={-1} textAnchor="middle" fill="#f8fafc" fontSize={13} fontWeight={800}>
          {worker.name}
        </text>
        <text x={0} y={11} textAnchor="middle" fill="#94a3b8" fontSize={10}>
          {worker.title}
        </text>
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
  const atTable = office.workers.find((w) => w.atTheTable) ?? null;
  // Anybody whose job has stopped goes to bed next door, rather than
  // being drawn slumped at a desk on the floor where it reads as
  // somebody having a nap at work.
  const asleep = office.workers.filter((w) => !w.atTheTable && w.doing === "asleep");
  const onFloor = office.workers.filter((w) => !w.atTheTable && w.doing !== "asleep");

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

          {/* Windows.
              They were two flat blue rectangles with a dot in each and
              read as noticeboards — the first person to see them asked
              what they were. A sill, a frame, a skyline and a few
              stars is what makes a window look like a window. */}
          {[46, 236].map((x) => (
            <g key={x}>
              <defs>
                <linearGradient id={`sky-${x}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0b2545" />
                  <stop offset="100%" stopColor="#13395f" />
                </linearGradient>
              </defs>
              <rect x={x} y={28} width={160} height={110} rx={4} fill={`url(#sky-${x})`} />

              {/* The town at night, which is the point: they work while
                  the lights are off everywhere else. */}
              <g opacity={0.85}>
                <rect x={x + 10} y={96} width={22} height={42} fill="#0a1b30" />
                <rect x={x + 36} y={78} width={18} height={60} fill="#0a1b30" />
                <rect x={x + 58} y={104} width={26} height={34} fill="#0a1b30" />
                <rect x={x + 88} y={86} width={20} height={52} fill="#0a1b30" />
                <rect x={x + 112} y={100} width={30} height={38} fill="#0a1b30" />
                {[
                  [16, 104], [24, 118], [41, 86], [41, 104], [47, 120],
                  [64, 112], [74, 126], [93, 94], [101, 110], [118, 108], [132, 122],
                ].map(([dx, dy]) => (
                  <rect
                    key={`${dx}-${dy}`}
                    x={x + dx}
                    y={dy}
                    width={5}
                    height={6}
                    fill="#fcd34d"
                    opacity={0.75}
                  />
                ))}
              </g>

              {/* A moon and a couple of stars. */}
              <circle cx={x + 124} cy={52} r={11} fill="#e2e8f0" opacity={0.9} />
              <circle cx={x + 119} cy={48} r={9} fill={`url(#sky-${x})`} />
              {[[28, 44], [60, 36], [88, 58], [44, 66]].map(([dx, dy]) => (
                <circle key={`${dx}-${dy}`} cx={x + dx} cy={dy} r={1.8} fill="#e2e8f0" opacity={0.75} />
              ))}

              {/* Frame, glazing bars and a sill. */}
              <rect x={x} y={28} width={160} height={110} rx={4} fill="none" stroke="#475569" strokeWidth={6} />
              <line x1={x + 80} y1={28} x2={x + 80} y2={138} stroke="#475569" strokeWidth={5} />
              <line x1={x} y1={83} x2={x + 160} y2={83} stroke="#475569" strokeWidth={5} />
              <rect x={x - 8} y={138} width={176} height={9} rx={3} fill="#64748b" />
            </g>
          ))}

          {/* The name on the wall, and what the room is for.
              Walid asked for both, and the goal in his own words: make
              money, fast, before it is too late. It sits above every
              desk because it is the thing all of them are for. */}
          <g>
            {/* One text element with a space in it, rather than two
                placed by hand. The second was positioned at a guessed
                offset and came out as SHAZMARKETING. */}
            <text x={40} y={206} fontSize={42} fontWeight={800} letterSpacing="2">
              <tspan fill="#f8fafc">SHAZ</tspan>
              <tspan fill="var(--brand-pink, #ec4899)">  MARKETING</tspan>
            </text>
            <rect x={40} y={220} width={470} height={3} rx={1.5} fill="var(--brand-pink, #ec4899)" opacity={0.8} />
            <text x={40} y={254} fill="#94a3b8" fontSize={16} fontWeight={700} letterSpacing="0.5">
              THE GOAL — MAKE MONEY, FAST. BEFORE IT&apos;S TOO LATE.
            </text>
          </g>

          {/* A clock, because the whole point of this lot is the hours
              nobody is in to work them. */}
          <g transform="translate(790 96)">
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

          {/* A whiteboard with the week on it. Blank lines rather than
              invented writing: a board with made-up targets on it
              would be the one thing on this page that is not true. */}
          <g transform="translate(430 34)">
            <rect x={0} y={0} width={182} height={108} rx={6} fill="#e2e8f0" opacity={0.92} />
            <rect x={0} y={0} width={182} height={108} rx={6} fill="none" stroke="#475569" strokeWidth={4} />
            <rect x={16} y={20} width={98} height={7} rx={3} fill="#94a3b8" />
            <rect x={16} y={40} width={142} height={6} rx={3} fill="#cbd5e1" />
            <rect x={16} y={56} width={84} height={6} rx={3} fill="#cbd5e1" />
            <rect x={16} y={72} width={118} height={6} rx={3} fill="#cbd5e1" />
            <rect x={61} y={108} width={60} height={6} rx={3} fill="#64748b" />
          </g>

          {/* A water cooler and a plant, so the floor reads as a room
              rather than as a chart with people drawn on it. */}
          <g transform={`translate(${PARTITION - 46} ${ROOM.wall + 4})`}>
            <rect x={-16} y={-70} width={32} height={44} rx={5} fill="#38bdf8" opacity={0.45} />
            <rect x={-19} y={-28} width={38} height={30} rx={4} fill="#475569" />
          </g>
          <g transform="translate(486 860)">
            <ellipse cx={0} cy={10} rx={30} ry={7} fill="#000" opacity={0.3} />
            <rect x={-20} y={-30} width={40} height={38} rx={5} fill="#7c2d12" />
            <path d="M 0 -30 q -34 -24 -18 -58 q 18 14 18 58" fill="#15803d" />
            <path d="M 0 -30 q 34 -24 18 -58 q -18 14 -18 58" fill="#16a34a" />
            <path d="M 0 -30 q -6 -34 4 -52 q 6 24 -4 52" fill="#22c55e" />
          </g>

          {/* A seam across the floor between the two rows. A rug was the
              first attempt and at this size it read as a stain. */}
          <line x1={0} y1={468} x2={PARTITION} y2={468} stroke="#162032" strokeWidth={2} />

          {/* The wall between the floor and the room they sleep in. */}
          <rect x={PARTITION} y={60} width={22} height={ROOM.h - 60} fill="#1f2937" />
          <rect x={PARTITION + 4} y={60} width={6} height={ROOM.h - 60} fill="#0b1220" opacity={0.6} />

          {/* The bunk room. Dimmer than the floor, because nothing in
              here is running. */}
          <rect
            x={PARTITION + 22}
            y={ROOM.wall}
            width={ROOM.w - PARTITION - 22}
            height={ROOM.h - ROOM.wall}
            fill="#0a1120"
          />
          <g transform={`translate(${(PARTITION + 22 + ROOM.w) / 2} 150)`}>
            <rect
              x={-150}
              y={-26}
              width={300}
              height={38}
              rx={10}
              fill="#0b1220"
              stroke={asleep.length > 0 ? "#ef4444" : "#2a3a52"}
              strokeWidth={2}
            />
            <text x={0} y={0} textAnchor="middle" fill="#cbd5e1" fontSize={14} fontWeight={800} letterSpacing="1">
              ASLEEP · {asleep.length} NOT RUNNING
            </text>
            <text x={0} y={46} textAnchor="middle" fill="#64748b" fontSize={13}>
              {asleep.length === 0
                ? "Empty. Everything is switched on."
                : "These jobs should be running and are not."}
            </text>
          </g>

          {/* The bunks. Two frames, four beds; anybody past the fourth
              is counted underneath rather than drawn on the floor. */}
          {[0, 1].map((frame) => {
            const x = PARTITION + 22 + 116 + frame * 218;
            return (
              <g key={frame}>
                {/* Posts and rails. */}
                <rect x={x - 102} y={300} width={11} height={520} rx={4} fill="#334155" />
                <rect x={x + 91} y={300} width={11} height={520} rx={4} fill="#334155" />
                <rect x={x - 102} y={300} width={204} height={9} rx={4} fill="#475569" />
                <rect x={x - 102} y={448} width={204} height={9} rx={4} fill="#475569" />
                <rect x={x - 102} y={660} width={204} height={9} rx={4} fill="#475569" />
                <rect x={x - 108} y={814} width={216} height={12} rx={5} fill="#1f2937" />
                {/* The ladder. */}
                {[500, 540, 580, 620].map((y) => (
                  <rect key={y} x={x + 96} y={y} width={34} height={7} rx={3} fill="#475569" />
                ))}
              </g>
            );
          })}

          {asleep.slice(0, 4).map((worker, i) => {
            const x = PARTITION + 22 + 116 + (i % 2) * 218;
            const y = i < 2 ? 420 : 632;
            return (
              <g key={worker.id} transform={`translate(${x} ${y}) scale(0.9)`}>
                <Bunk
                  worker={worker}
                  index={i + 9}
                  selected={openId === worker.id}
                  onPick={() => setOpenId(openId === worker.id ? null : worker.id)}
                />
              </g>
            );
          })}
          {asleep.length > 4 && (
            <text
              x={(PARTITION + 22 + ROOM.w) / 2}
              y={880}
              textAnchor="middle"
              fill="#94a3b8"
              fontSize={14}
              fontWeight={700}
            >
              and {asleep.length - 4} more asleep
            </text>
          )}

          {onFloor.map((worker, i) => {
            const desk = DESKS[deskFor(i, onFloor.length)];
            return (
              <g
                key={worker.id}
                transform={`translate(${desk.x} ${desk.y})`}
                onClick={() => setOpenId(openId === worker.id ? null : worker.id)}
                className="office-desk cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-pink,#ec4899)]"
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
                <ellipse cx={0} cy={88} rx={58} ry={10} fill="#000" opacity={0.35} />
                {/* The person first, then the desk in front of them.
                    The other way round put their legs over the desk
                    top, which read as standing rather than sitting. */}
                <Person worker={worker} index={i} selected={openId === worker.id} />
                <Desk />
                <Laptop />

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
          <g transform="translate(150 806)">
            <rect x={-104} y={-34} width={208} height={40} rx={14} fill="#334155" />
            <rect x={-96} y={-14} width={192} height={38} rx={12} fill="#475569" />
            <rect x={-88} y={-20} width={82} height={26} rx={9} fill="#3f4e63" />
            <rect x={6} y={-20} width={82} height={26} rx={9} fill="#3f4e63" />
            <rect x={-100} y={24} width={14} height={14} rx={3} fill="#1e293b" />
            <rect x={86} y={24} width={14} height={14} rx={3} fill="#1e293b" />
          </g>
          <g transform="translate(330 834)">
            <ellipse cx={0} cy={26} rx={56} ry={9} fill="#000" opacity={0.3} />
            <rect x={-54} y={-8} width={108} height={12} rx={4} fill="#475569" />
            <rect x={-46} y={4} width={7} height={20} fill="#334155" />
            <rect x={39} y={4} width={7} height={20} fill="#334155" />
            <rect x={-26} y={-18} width={13} height={11} rx={2.5} fill="#f1f5f9" />
            <rect x={6} y={-18} width={13} height={11} rx={2.5} fill="#f1f5f9" />
          </g>

          {/* A printer, a filing cabinet and a bin down the right-hand
              side, which is where this lot always end up. */}
          <g transform="translate(1120 812)">
            <ellipse cx={0} cy={44} rx={56} ry={12} fill="#000" opacity={0.3} />
            <rect x={-46} y={-26} width={92} height={70} rx={8} fill="#475569" />
            <rect x={-34} y={-38} width={68} height={14} rx={4} fill="#334155" />
            <rect x={-38} y={-6} width={76} height={10} rx={3} fill="#1e293b" />
            <rect x={-26} y={10} width={52} height={22} rx={3} fill="#f1f5f9" opacity={0.9} />
            <circle cx={34} cy={-14} r={4} fill="#4ade80" />
          </g>
          <g transform="translate(1262 804)">
            <ellipse cx={0} cy={52} rx={48} ry={12} fill="#000" opacity={0.3} />
            <rect x={-40} y={-34} width={80} height={86} rx={6} fill="#3f4e63" />
            {[-20, 6, 32].map((y) => (
              <g key={y}>
                <rect x={-34} y={y} width={68} height={20} rx={3} fill="#475569" />
                <rect x={-8} y={y + 8} width={16} height={4} rx={2} fill="#1e293b" />
              </g>
            ))}
          </g>
          <g transform="translate(1348 848)">
            <path d="M -14 -22 l 28 0 l -4 34 l -20 0 z" fill="#334155" />
            <rect x={-16} y={-26} width={32} height={6} rx={3} fill="#475569" />
          </g>

          {/* A second plant on the other side, so the room is not
              lopsided. */}
          <g transform="translate(960 866)">
            <ellipse cx={0} cy={10} rx={26} ry={7} fill="#000" opacity={0.3} />
            <rect x={-17} y={-26} width={34} height={34} rx={5} fill="#7c2d12" />
            <path d="M 0 -26 q -28 -20 -15 -48 q 15 12 15 48" fill="#166534" />
            <path d="M 0 -26 q 28 -20 15 -48 q -15 12 -15 48" fill="#15803d" />
          </g>

          {/* The table at the front, and the one who sits at it.
              He faces the room rather than a queue of his own, because
              his job is the room: what is broken now and what will
              break tomorrow. */}
          <g transform="translate(700 856)">
            <ellipse cx={0} cy={40} rx={168} ry={16} fill="#000" opacity={0.3} />
            {[-120, 120].map((x) => (
              <g key={x} transform={`translate(${x} 0)`}>
                <rect x={-17} y={-40} width={34} height={30} rx={7} fill="#3f4e63" />
                <rect x={-15} y={10} width={30} height={9} rx={4} fill="#3f4e63" />
              </g>
            ))}
          </g>

          {atTable && (
            <g
              transform="translate(700 830)"
              className="office-desk cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-pink,#ec4899)]"
              onClick={() => setOpenId(openId === atTable.id ? null : atTable.id)}
              tabIndex={0}
              role="button"
              aria-label={`${atTable.name}, ${atTable.title}. ${atTable.says}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setOpenId(openId === atTable.id ? null : atTable.id);
                }
              }}
            >
              <Person worker={atTable} index={13} selected={openId === atTable.id} />
              {/* The table top, drawn over him so he is sat at it. */}
              <g transform="translate(0 26)">
                <rect x={-150} y={-10} width={300} height={18} rx={7} fill="#52627a" />
                <rect x={-132} y={8} width={12} height={32} fill="#334155" />
                <rect x={120} y={8} width={12} height={32} fill="#334155" />
                <rect x={-104} y={-22} width={62} height={13} rx={3} fill="#1e293b" />
                <rect x={44} y={-20} width={56} height={11} rx={3} fill="#1e293b" />
              </g>
              <g transform="translate(0 -26)">
                <Laptop />
              </g>

              <g transform="translate(0 -78)">
                <rect
                  x={-74}
                  y={-20}
                  width={148}
                  height={34}
                  rx={9}
                  fill="#0f172a"
                  stroke={
                    atTable.doing === "talking" ? "#ef4444" : "var(--brand-pink, #ec4899)"
                  }
                  strokeWidth={2}
                />
                <text x={0} y={-6} textAnchor="middle" fill="#f8fafc" fontSize={14} fontWeight={800}>
                  {atTable.name}
                </text>
                <text x={0} y={8} textAnchor="middle" fill="#94a3b8" fontSize={10.5}>
                  {atTable.title}
                </text>
              </g>

              {atTable.doing === "talking" && (
                <g className="office-bubble" transform="translate(0 -134)">
                  <rect x={-150} y={-18} width={300} height={38} rx={11} fill="#fef3c7" />
                  <path d="M -9 20 l 9 13 l 9 -13 z" fill="#fef3c7" />
                  <text x={0} y={6} textAnchor="middle" fill="#78350f" fontSize={13} fontWeight={700}>
                    {atTable.says.length > 44 ? `${atTable.says.slice(0, 43)}…` : atTable.says}
                  </text>
                </g>
              )}
            </g>
          )}

          {/* A printer that is always out of paper, a cabinet, a bin. */}
          <g transform="translate(1130 818)">
            <ellipse cx={0} cy={44} rx={56} ry={10} fill="#000" opacity={0.3} />
            <rect x={-46} y={-26} width={92} height={70} rx={8} fill="#475569" />
            <rect x={-34} y={-38} width={68} height={14} rx={4} fill="#334155" />
            <rect x={-38} y={-6} width={76} height={10} rx={3} fill="#1e293b" />
            <rect x={-26} y={10} width={52} height={22} rx={3} fill="#f1f5f9" opacity={0.9} />
            <circle cx={34} cy={-14} r={4} fill="#4ade80" />
          </g>
          <g transform="translate(1272 810)">
            <ellipse cx={0} cy={52} rx={48} ry={10} fill="#000" opacity={0.3} />
            <rect x={-40} y={-34} width={80} height={86} rx={6} fill="#3f4e63" />
            {[-20, 6, 32].map((y) => (
              <g key={y}>
                <rect x={-34} y={y} width={68} height={20} rx={3} fill="#475569" />
                <rect x={-8} y={y + 8} width={16} height={4} rx={2} fill="#1e293b" />
              </g>
            ))}
          </g>
          <g transform="translate(1352 850)">
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

          {/* What he has actually found. Only he has a list, because
              only he is looking at anything other than his own work. */}
          {open.risks && (
            <div className="mt-4 border-t border-border pt-4">
              {open.risks.length === 0 ? (
                <p className="text-sm text-muted">
                  Nothing on his list. The lists have businesses on them, the jobs have all run,
                  no callback has been missed and the budget is on track.
                </p>
              ) : (
                <ul className="flex flex-col gap-2.5">
                  {open.risks.map((risk) => (
                    <li
                      key={risk.title}
                      className={`rounded-xl border px-3.5 py-2.5 ${
                        risk.level === "bad"
                          ? "border-red-500/50 bg-red-500/5"
                          : "border-border bg-background"
                      }`}
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {risk.title}
                        <span className="ml-2 text-[11px] font-normal text-muted">
                          {risk.when === "today" ? "now" : "tomorrow"}
                        </span>
                      </p>
                      <p className="mt-0.5 text-xs text-muted">{risk.detail}</p>
                      {risk.fix && <p className="mt-1 text-xs text-foreground">{risk.fix}</p>}
                      {risk.href && (
                        <Link
                          href={risk.href}
                          className="mt-1.5 inline-block text-[11px] font-semibold text-brand-pink"
                        >
                          Take a look →
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted">
          Press anybody to see what they have done and whether they are still doing it. Whoever has
          handled the most sits at the front. Every number on this page is counted from the
          database — nobody here is acting.
        </p>
      )}
    </div>
  );
}

import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { type BadgeId, type BorderId, type FlagId, type StyleId, badges, borders, cleanShowText, formatReg, sizes, styles } from "@/lib/plates";
import { site } from "@/lib/site";
import { HEX_INSET, MARGIN, fontFor, hexPoints, legalLayout, plateLines, showFontSize } from "@/lib/plate-layout";

// Draws a plate as a PNG for emails (email apps can't show the SVG preview).
// Used by /api/plate-image and attached straight into order emails.

// 2 pixels per millimetre: a standard plate is 1040 × 222.
const PX = 2;

const flagSvg: Record<FlagId, string> = {
  uk: `<rect width="30" height="20" fill="#012169"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/><path d="M0 0L30 20M30 0L0 20" stroke="#C8102E" stroke-width="1.4"/><path d="M15 0V20M0 10H30" stroke="#fff" stroke-width="6.4"/><path d="M15 0V20M0 10H30" stroke="#C8102E" stroke-width="3.6"/>`,
  eng: `<rect width="30" height="20" fill="#fff"/><path d="M15 0V20M0 10H30" stroke="#CE1124" stroke-width="4.4"/>`,
  sco: `<rect width="30" height="20" fill="#005EB8"/><path d="M0 0L30 20M30 0L0 20" stroke="#fff" stroke-width="4"/>`,
  cym: `<rect width="30" height="10" fill="#fff"/><rect y="10" width="30" height="10" fill="#00B140"/><path d="M6 14Q10.5 5 16.5 8L24 4.4L21 10Q18 16 9 15.6Z" fill="#D30731"/>`,
};

function flagDataUri(f: FlagId) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20" width="60" height="40">${flagSvg[f]}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

let font: Promise<Buffer> | null = null;

export async function renderPlate(q: URLSearchParams) {
  const type = q.get("type") === "show" ? "show" : "legal";
  const raw = q.get("text") ?? "";
  const text = (type === "show" ? cleanShowText(raw).trim() : formatReg(raw)) || "YOUR REG";
  const style = styles.find((s) => s.id === (q.get("style") as StyleId)) ?? styles[0];
  const size = sizes.find((s) => s.id === q.get("size")) ?? sizes[0];
  const { hex } = size;
  // Hex and two-line plates have no room for a flag; hex plates no border either.
  const badge = size.badge ? (badges.find((b) => b.id === (q.get("badge") as BadgeId)) ?? badges[0]) : badges[0];
  const border = size.border ? (borders.find((b) => b.id === (q.get("border") as BorderId))?.id ?? "none") : "none";
  const rear = q.get("side") !== "front";
  const W = size.width * PX;
  const H = size.height * PX;
  const plateColour = rear ? "#f6c500" : "#f8f8f5";
  // The hex outline in pixels, 2px in so its edge isn't cut off.
  const hexOutline = hexPoints(size.width - 2, size.height - 2)
    .map(([x, y]) => `${(x + 1) * PX},${(y + 1) * PX}`)
    .join(" ");

  font ??= readFile(join(process.cwd(), "src/assets/BarlowCondensed-SemiBold.ttf"));
  const fontData = await font;

  const bandW = badge.id === "none" ? 0 : 100;
  // The same layout as the website preview (PlatePreview), at 2px per mm.
  const px = PX;
  const available = (W - bandW) / px - MARGIN * 2 - (hex ? HEX_INSET * 2 : 0);
  // Motorbike and 4x4 / import plates are on two lines.
  const dims = { charH: size.charH, charW: size.charW, gap: size.gap };
  const lines = plateLines(text, size.lines);
  const layouts = type === "legal" ? lines.map((l) => legalLayout(l, dims)) : null;
  const scale = layouts ? Math.min(1, ...layouts.map((l) => available / l.width)) : 1;
  const fontMm = layouts ? fontFor(dims) * scale : Math.min(...lines.map((l) => showFontSize(l, available, 2, fontFor(dims))));
  const fontSize = fontMm * px;
  // Each line is a band the letters are centred in (px). One line fills the
  // plate above the maker's mark; two lines sit either side of the line gap.
  const capPx = fontMm * 0.7 * px;
  const rows =
    lines.length === 1
      ? [{ top: 0, height: H - 34 }]
      : (() => {
          // 2mm above centre, as on the website preview.
          // Centring a row puts the capitals about 0.057em below its middle
          // (room the font keeps for descenders), so lift them back.
          const top = (H - (capPx * 2 + size.lineGap * px)) / 2 - 2 * px - fontSize * 0.057;
          return [
            { top: top - capPx * 0.3, height: capPx * 1.6 },
            { top: top + capPx + size.lineGap * px - capPx * 0.3, height: capPx * 1.6 },
          ];
        })();
  const depth = style.depth * 2;
  // Blurring a shadow takes a lot of memory, and on the shared hosting a
  // blur over about 3px made the thicker styles (4D, 5mm/7mm gel) fail to
  // draw at all. The solid offset gives the raised look; the blur only softens it.
  const blur = (b: number) => Math.min(b, 3);
  const shadow =
    depth > 0
      ? style.look === "acrylic"
        ? `${depth * 0.6}px ${depth}px 0px #4a4a4a, ${depth * 0.8}px ${depth * 2}px ${blur(depth * 2)}px rgba(0,0,0,0.45)`
        : `${depth * 0.4}px ${depth * 1.2}px ${blur(1 + depth)}px rgba(0,0,0,0.5)`
      : "none";

  const gel = style.look === "gel";

  // The registration, drawn once for the letters and again (gel only) for
  // their shine. `shift` moves everything up, for drawing inside a shine band.
  const letters = (look: React.CSSProperties, shift = 0) =>
    lines.flatMap((line, li) => {
      const row = rows[li];
      const layout = layouts?.[li];
      if (!layout)
        return [
          <div
            key={li}
            style={{
              position: "absolute",
              left: bandW,
              right: 0,
              top: row.top - shift,
              height: row.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Plate",
              fontSize,
              letterSpacing: 4,
              whiteSpace: "pre",
              ...look,
            }}
          >
            {line}
          </div>,
        ];
      const startX = bandW + (W - bandW - layout.width * scale * px) / 2;
      return layout.cells.map((cell, i) => (
        <div
          key={`${li}-${i}`}
          style={{
            position: "absolute",
            left: startX + (cell.centre - dims.charW / 2) * scale * px,
            width: dims.charW * scale * px,
            top: row.top - shift,
            height: row.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Plate",
            fontSize,
            ...look,
            ...(cell.squeeze < 1 && { transform: `scaleX(${cell.squeeze})` }),
          }}
        >
          {cell.ch}
        </div>
      ));
    });

  // Where the light catches the gel on each line: a soft sheen over the top
  // half of the letters and a bright streak near the top.
  const shineBands = rows.slice(0, lines.length).flatMap((row) => {
    const letterTop = row.top + row.height / 2 - capPx / 2;
    return [
      { top: letterTop + capPx * 0.03, height: capPx * 0.5, alpha: 0.09 },
      { top: letterTop + capPx * 0.17, height: Math.max(4, capPx * 0.05), alpha: 0.24 },
    ];
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          position: "relative",
          // A hex plate is drawn as a shape underneath, with see-through corners.
          ...(hex
            ? {}
            : {
                borderRadius: 14,
                border: "2px solid rgba(0,0,0,0.15)",
                background: plateColour,
                backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%), linear-gradient(0deg, ${plateColour}, ${plateColour})`,
              }),
        }}
      >
        {hex && (
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
            <defs>
              <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0.35" />
                <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points={hexOutline} fill={plateColour} stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeLinejoin="round" />
            <polygon points={hexOutline} fill="url(#sheen)" />
          </svg>
        )}
        {bandW > 0 && (
          <div
            style={{
              position: "absolute",
              left: 6,
              top: 6,
              bottom: 6,
              width: bandW - 6,
              borderRadius: 10,
              background: badge.green ? "#00a651" : "#0b3c91",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
            {badge.flag && <img src={flagDataUri(badge.flag)} width={60} height={40} alt="" />}
            {badge.code && (
              <div style={{ color: "#fff", fontFamily: "Plate", fontSize: badge.flag ? (badge.code.length > 2 ? 30 : 38) : 52 }}>
                {badge.code}
              </div>
            )}
          </div>
        )}
        {border === "black" && (
          <div style={{ position: "absolute", left: 10, top: 10, right: 10, bottom: 10, border: "6px solid #111", borderRadius: 10 }} />
        )}
        {letters({ color: "#111", textShadow: shadow })}
        {/* Gel letters are domed, glossy resin: a soft sheen on the upper part of */}
        {/* each letter and a bright streak where the light catches it. Images */}
        {/* can't fill text with a gradient, so these are bands of the letters cut out in white. */}
        {gel &&
          shineBands.map(({ top, height, alpha }) => (
            <div key={top} style={{ position: "absolute", left: 0, top, width: W, height, overflow: "hidden", display: "flex" }}>
              {letters({ color: `rgba(255,255,255,${alpha})`, textShadow: "none" }, top)}
            </div>
          ))}
        <div
          style={{
            position: "absolute",
            left: bandW,
            right: 0,
            bottom: 8,
            display: "flex",
            justifyContent: "center",
            fontSize: 12,
            color: "#444",
          }}
        >
          {type === "show" ? "SHOW PLATE · NOT FOR ROAD USE" : `${site.name.toUpperCase()} ${site.postcode} · BS AU 145e`}
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      fonts: [{ name: "Plate", data: fontData, style: "normal", weight: 600 }],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}

export async function renderPlatePng(q: URLSearchParams) {
  return Buffer.from(await (await renderPlate(q)).arrayBuffer());
}

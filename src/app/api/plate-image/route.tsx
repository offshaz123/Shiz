import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { type BadgeId, type BorderId, type FlagId, type StyleId, badges, borders, cleanShowText, formatReg, styles } from "@/lib/plates";
import { site } from "@/lib/site";

// A PNG of a plate for emails (email apps can't show the SVG preview).
// /api/plate-image?text=AB12%20CDE&type=legal&style=3d-gel&badge=uk&border=none&side=rear

const W = 1040;
const H = 222;

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

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const type = q.get("type") === "show" ? "show" : "legal";
  const raw = q.get("text") ?? "";
  const text = (type === "show" ? cleanShowText(raw).trim() : formatReg(raw)) || "YOUR REG";
  const style = styles.find((s) => s.id === (q.get("style") as StyleId)) ?? styles[0];
  const badge = badges.find((b) => b.id === (q.get("badge") as BadgeId)) ?? badges[0];
  const border = borders.find((b) => b.id === (q.get("border") as BorderId))?.id ?? "none";
  const rear = q.get("side") !== "front";

  font ??= readFile(join(process.cwd(), "src/assets/BarlowCondensed-SemiBold.ttf"));
  const fontData = await font;

  const bandW = badge.id === "none" ? 0 : badge.green && !badge.code ? 36 : 100;
  const fontSize = Math.min(172, ((172 * 8.5) / Math.max(text.length, 1)) * ((W - bandW * 2) / 940));
  const depth = style.depth * 2;
  const shadow =
    depth > 0
      ? style.look === "acrylic"
        ? `${depth * 0.6}px ${depth}px 0px #4a4a4a, ${depth * 0.8}px ${depth * 2}px ${depth * 2}px rgba(0,0,0,0.45)`
        : `${depth * 0.4}px ${depth * 1.2}px ${1 + depth}px rgba(0,0,0,0.5)`
      : "none";

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          display: "flex",
          position: "relative",
          borderRadius: 14,
          background: rear ? "#f6c500" : "#f8f8f5",
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%), linear-gradient(0deg, ${rear ? "#f6c500" : "#f8f8f5"}, ${rear ? "#f6c500" : "#f8f8f5"})`,
          border: "2px solid rgba(0,0,0,0.15)",
        }}
      >
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
        <div
          style={{
            position: "absolute",
            left: bandW,
            right: 0,
            top: 0,
            bottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "Plate",
            fontSize,
            letterSpacing: 4,
            color: "#111",
            whiteSpace: "pre",
            textShadow: shadow,
          }}
        >
          {text}
        </div>
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

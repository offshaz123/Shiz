import { ImageResponse } from "next/og";
import { KINDS, isKind } from "@/lib/listings";
import { renderPlatePng } from "@/lib/plate-image";
import { sizes, styles } from "@/lib/plates";

// The square product picture for Google Shopping: the plates of one listing
// (lib/listings) on a plain background, laid out like a product photo.
// /api/product-image?style=3d-gel&kind=pair

const SIDE = 1200;

export async function GET(req: Request) {
  const q = new URL(req.url).searchParams;
  const style = styles.find((s) => s.id === q.get("style"))?.id ?? "3d-gel";
  const kind = isKind(q.get("kind") ?? "") ? (q.get("kind") as keyof typeof KINDS) : "pair";
  const config: { size?: string; which?: string; type?: string } = KINDS[kind].config;
  const size = sizes.find((s) => s.id === config.size) ?? sizes[0];
  const type = config.type === "show" ? "show" : "legal";
  const sides = config.which === "rear" ? ["rear"] : ["front", "rear"];
  const plates = await Promise.all(
    sides.map(async (side) => {
      const png = await renderPlatePng(
        new URLSearchParams({ text: type === "show" ? "YOUR NAME" : "PL24 TED", type, style, size: size.id, badge: "none", border: "none", side, hero: "1" }),
      );
      return { side, src: `data:image/png;base64,${png.toString("base64")}` };
    }),
  );
  // Plates are drawn at 2px per mm. A pair is laid like a photo: the rear
  // plate in front, the front plate behind it and a little higher, both at a
  // slight angle, filling most of the picture.
  const twoLine = size.lines === 2;
  const pair = plates.length === 2;
  const maxW = twoLine ? (pair ? 560 : 820) : pair ? 1000 : 1060;
  const scale = Math.min(maxW / (size.width * 2), (twoLine ? 760 : 400) / (size.height * 2));
  const w = Math.round(size.width * 2 * scale);
  const h = Math.round(size.height * 2 * scale);
  const tilt = -5;
  const yellowEdge = "#b88f00";
  const whiteEdge = "#bdbbb2";
  // Where each plate sits (its centre), as a share of the picture.
  const spots = pair ? (twoLine ? [{ x: 0.3, y: 0.4 }, { x: 0.7, y: 0.6 }] : [{ x: 0.47, y: 0.36 }, { x: 0.53, y: 0.63 }]) : [{ x: 0.5, y: 0.5 }];
  const thick = Math.max(4, Math.round(6 * scale));

  return new ImageResponse(
    (
      <div
        style={{
          width: SIDE,
          height: SIDE,
          display: "flex",
          position: "relative",
          background: "linear-gradient(180deg, #fbfaf7 0%, #f1efe9 55%, #e4e1d8 100%)",
        }}
      >
        {/* No blurred shadows: on the shared hosting a big blur runs out of
            memory and the picture fails (see lib/plate-image). Soft shadows
            are gradients and stacked see-through shapes instead. */}
        {plates.map((p, i) => {
          const { x, y } = spots[i];
          const left = Math.round(SIDE * x - w / 2);
          const top = Math.round(SIDE * y - h / 2);
          const edge = p.side === "rear" ? yellowEdge : whiteEdge;
          return (
            <div key={i} style={{ position: "absolute", left, top, width: w, height: h + thick, display: "flex", transform: `rotate(${tilt}deg)` }}>
              {/* The shadow on the table: soft, below and to the right, built
                  from see-through rounded layers (no blur). */}
              {Array.from({ length: 10 }, (_, n) => (
                <div
                  key={n}
                  style={{
                    position: "absolute",
                    left: w * 0.02 + n * 3 - 6,
                    top: h * 0.08 + n * 3,
                    width: w + 12 - n * 2,
                    height: h + 12 - n * 2,
                    borderRadius: 30,
                    background: "rgba(60,48,20,0.035)",
                    display: "flex",
                  }}
                />
              ))}
              {/* The plate's own thickness, showing along the bottom edge. */}
              {!size.hex && (
                <div style={{ position: "absolute", left: 1, top: thick, width: w - 2, height: h, borderRadius: 14 * scale, background: edge, display: "flex" }} />
              )}
              {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img */}
              <img src={p.src} width={w} height={h} alt="" style={{ position: "absolute", left: 0, top: 0 }} />
              {/* A soft reflection across the face of the plate. */}
              {!size.hex && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: w,
                    height: h,
                    borderRadius: 14 * scale,
                    display: "flex",
                    backgroundImage:
                      "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.22) 42%, rgba(255,255,255,0) 52%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.12) 76%, rgba(255,255,255,0) 82%)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    ),
    { width: SIDE, height: SIDE, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}

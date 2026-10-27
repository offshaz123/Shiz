import { ImageResponse } from "next/og";
import { KINDS, isKind } from "@/lib/listings";
import { renderPlatePng } from "@/lib/plate-image";
import { sizes, styles } from "@/lib/plates";

// The square product picture for Google Shopping: the plates of one listing
// (lib/listings) on a plain background, front above rear for a pair.
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
      const png = await renderPlatePng(new URLSearchParams({ text: type === "show" ? "YOUR NAME" : "PL24 TED", type, style, size: size.id, badge: "none", border: "none", side }));
      return `data:image/png;base64,${png.toString("base64")}`;
    }),
  );
  // Plates are drawn at 2px per mm. Two-line plates sit side by side, long ones one above the other.
  const across = size.lines === 2 && plates.length === 2;
  const gap = 70;
  const room = SIDE - 240;
  const scale = across
    ? Math.min(1.6, (room - gap) / 2 / (size.width * 2))
    : Math.min(1.6, room / (size.width * 2), (room - gap * (plates.length - 1)) / plates.length / (size.height * 2));
  const w = Math.round(size.width * 2 * scale);
  const h = Math.round(size.height * 2 * scale);

  return new ImageResponse(
    (
      <div
        style={{
          width: SIDE,
          height: SIDE,
          display: "flex",
          flexDirection: across ? "row" : "column",
          alignItems: "center",
          justifyContent: "center",
          gap,
          background: "linear-gradient(180deg, #f4f3ef 0%, #e6e4dd 100%)",
        }}
      >
        {/* No blurred shadow: on the shared hosting a big blur runs out of memory
            and the picture fails (see lib/plate-image). A thin outline instead,
            except round the hex shape, where it would show as a box. */}
        {plates.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse needs a plain img
          <img key={i} src={src} width={w} height={h} alt="" style={size.hex ? {} : { border: "2px solid #cfccc2", borderRadius: 10 }} />
        ))}
      </div>
    ),
    { width: SIDE, height: SIDE, headers: { "Cache-Control": "public, max-age=86400" } },
  );
}

import { ImageResponse } from "next/og";
import { brand } from "@/lib/brand";

export const alt = `${brand.name} — business payment accounts for UK importers and wholesalers`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Generated at build time, so there is no static OG image file to keep updated. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#14110d",
          color: "#faf7f2",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#b4541f",
              display: "flex",
            }}
          />
          <div style={{ fontSize: 34, fontWeight: 600 }}>{brand.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
            Collect. Convert. Pay your suppliers.
          </div>
          <div style={{ fontSize: 30, color: "#a39887", lineHeight: 1.35 }}>
            Business payment accounts in your own company name, for UK importers, wholesalers and
            distributors.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, fontSize: 24, color: "#e07b3c" }}>
          <div>USD</div>
          <div style={{ color: "#5d564c" }}>·</div>
          <div>AED</div>
          <div style={{ color: "#5d564c" }}>·</div>
          <div>HKD</div>
          <div style={{ color: "#5d564c" }}>·</div>
          <div>EUR</div>
        </div>
      </div>
    ),
    size
  );
}

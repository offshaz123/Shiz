import { ImageResponse } from "next/og";

export const alt = "SMG Details — Car Tinting, Wrapping & Servicing in Romford";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#06090c",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 56,
              fontWeight: 800,
              color: "#fff",
              background: "#0ea5c4",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 800, color: "#fff" }}>
            <span>SMG&nbsp;</span>
            <span style={{ color: "#22d3ee" }}>DETAILS</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 42,
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            maxWidth: 920,
            display: "flex",
          }}
        >
          Tinting, wrapping &amp; servicing. Done properly.
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#93a3ac",
            textAlign: "center",
            display: "flex",
          }}
        >
          Window Tinting · Wrapping · Servicing · Number Plates · Alloy Refurb
        </div>
      </div>
    ),
    { ...size }
  );
}

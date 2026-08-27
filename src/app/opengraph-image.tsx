import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Exclusive Tints & Repairs — Premium Window Tinting & Car Servicing";
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
          backgroundColor: "#060607",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 52,
              fontWeight: 800,
              color: "#c9a227",
              background: "#0a0a0b",
              border: "2px solid #c9a227",
            }}
          >
            E
          </div>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800, color: "#fff" }}>
            <span>EXCLUSIVE&nbsp;</span>
            <span style={{ color: "#c9a227" }}>TINTS</span>
            <span>&nbsp;&amp; REPAIRS</span>
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 40,
            fontWeight: 700,
            color: "#fff",
            textAlign: "center",
            maxWidth: 940,
            display: "flex",
          }}
        >
          Premium window tinting, finished to an executive standard
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#a2a2aa",
            textAlign: "center",
            display: "flex",
          }}
        >
          Standard · Ceramic · Chameleon Tint · Dechroming · Brakes · Servicing
        </div>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Executive Tints & Repairs — Premium Window Tinting & Car Servicing";
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
          backgroundColor: "#07060a",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: 86,
              fontWeight: 700,
              letterSpacing: 22,
              color: "#e8cf7e",
            }}
          >
            EXECUTIVE
          </div>
          <div style={{ display: "flex", width: 700, height: 2, background: "#a37c18", marginTop: 18 }} />
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontSize: 26,
              fontWeight: 600,
              letterSpacing: 16,
              color: "#a2977f",
            }}
          >
            TINTS &amp; REPAIRS
          </div>
        </div>
        <div
          style={{
            marginTop: 48,
            fontSize: 40,
            fontWeight: 700,
            color: "#f7f2e6",
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
            color: "#a2977f",
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

import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Shaz Marketing Group — Meta & Instagram Ads for Businesses";
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
          backgroundColor: "#08080a",
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
              background: "linear-gradient(135deg, #7b2ff7, #e0218a 55%, #f7941e)",
            }}
          >
            S
          </div>
          <div style={{ display: "flex", fontSize: 46, fontWeight: 800, color: "#fff" }}>
            <span>SHAZ&nbsp;</span>
            <span style={{ color: "#ff3ea5" }}>MARKETING</span>
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
          More leads. More bookings. One platform.
        </div>
        <div
          style={{
            marginTop: 20,
            fontSize: 26,
            color: "#a1a1ac",
            textAlign: "center",
            display: "flex",
          }}
        >
          Meta &amp; Instagram Ads · Lead Generation · All-in-One CRM · AI Receptionist
        </div>
      </div>
    ),
    { ...size }
  );
}

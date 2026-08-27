import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0b",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 40 40" fill="none">
          <path
            d="M20 6.5 30.5 12v8.2c0 6.4-4.4 11.6-10.5 13.3-6.1-1.7-10.5-6.9-10.5-13.3V12L20 6.5Z"
            stroke="#c9a227"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M14.5 20.2 18 23.7l7.5-7.9"
            stroke="#c9a227"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}

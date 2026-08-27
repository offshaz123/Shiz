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
          background: "#06090c",
        }}
      >
        <svg width="140" height="140" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="g" x1="2" y1="4" x2="38" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0f5f8c" />
              <stop offset="0.55" stopColor="#0ea5c4" />
              <stop offset="1" stopColor="#f2a922" />
            </linearGradient>
          </defs>
          <path
            d="M7 26.5c0-1.4 1-2.6 2.4-2.9l2.1-.4 2-4c.5-1 1.5-1.6 2.6-1.6h7.8c1.1 0 2.1.6 2.6 1.6l2 4 2.1.4c1.4.3 2.4 1.5 2.4 2.9v1.3c0 .7-.6 1.2-1.2 1.2h-1.6a2.6 2.6 0 0 1-5.1 0h-9.2a2.6 2.6 0 0 1-5.1 0H8.2c-.7 0-1.2-.5-1.2-1.2v-1.3Z"
            stroke="url(#g)"
            strokeWidth="1.8"
            strokeLinejoin="round"
            fill="none"
          />
          <path d="M13.5 21.5h13" stroke="url(#g)" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="14.5" cy="27" r="1.9" fill="url(#g)" />
          <circle cx="25.5" cy="27" r="1.9" fill="url(#g)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

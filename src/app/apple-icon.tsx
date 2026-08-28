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
        <svg width="150" height="150" viewBox="0 0 40 40" fill="none">
          <defs>
            <linearGradient id="g" x1="2" y1="4" x2="38" y2="36" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#0f5f8c" />
              <stop offset="0.55" stopColor="#0ea5c4" />
              <stop offset="1" stopColor="#f2a922" />
            </linearGradient>
          </defs>
          <path
            d="M20 1.5 36 10.5v18L20 38.5 4 28.5v-18L20 1.5Z"
            stroke="url(#g)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M11.5 24.8c0-1 .8-1.9 1.8-2.1l2.3-.5 2.4-3.4c.6-.9 1.7-1.4 2.8-1.4h.4c1.1 0 2.2.5 2.8 1.4l2.4 3.4 2.3.5c1 .2 1.8 1.1 1.8 2.1v.9c0 .6-.5 1-1 1h-1.1a2.2 2.2 0 0 1-4.3 0h-6.2a2.2 2.2 0 0 1-4.3 0h-1.1c-.6 0-1-.4-1-1v-.9Z"
            stroke="url(#g)"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path d="M15.5 20.8h9" stroke="url(#g)" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="16" cy="25.6" r="1.6" fill="url(#g)" />
          <circle cx="24" cy="25.6" r="1.6" fill="url(#g)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The compact mark, drawn as plain rectangles. ImageResponse has no webfont
// loaded here, so the "E" is a shape rather than a glyph.
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
          background: "#07060a",
        }}
      >
        <svg width="180" height="180" viewBox="0 0 64 64" fill="none">
          <defs>
            <linearGradient id="g" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#a37c18" />
              <stop offset="0.34" stopColor="#f6e6ae" />
              <stop offset="0.62" stopColor="#c9a227" />
              <stop offset="1" stopColor="#e8cf7e" />
            </linearGradient>
          </defs>
          <rect x="9" y="9" width="46" height="46" stroke="url(#g)" strokeWidth="2.6" />
          <rect x="22" y="18" width="6" height="28" fill="url(#g)" />
          <rect x="22" y="18" width="21" height="5.6" fill="url(#g)" />
          <rect x="22" y="29.2" width="15" height="5.6" fill="url(#g)" />
          <rect x="22" y="40.4" width="21" height="5.6" fill="url(#g)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}

import { ImageResponse } from "next/og";

// The picture shown when the site's link is shared (LinkedIn, WhatsApp, X, Slack...).
// Drawn at build time from the logo and the tagline, so it always matches the brand.
export const alt = "PORTFOLIO-VERSE: a free portfolio builder for students";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#12141a";
const ACCENT = "#8c52ff";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: "0 90px",
          background: "linear-gradient(135deg, #ffffff 0%, #f3edff 100%)",
          color: INK,
          fontFamily: "sans-serif",
        }}
      >
        {/* The logo: cap, round head and open-book legs */}
        <svg width="260" height="320" viewBox="0 0 650 800">
          <path d="M240 482H325L198 770 25 768Z" fill="none" stroke={INK} strokeWidth="34" strokeLinejoin="round" />
          <path d="M332 482H415L620 770H450Z" fill="none" stroke={INK} strokeWidth="34" strokeLinejoin="round" />
          <circle cx="330" cy="312" r="138" fill={ACCENT} />
          <path
            d="M155 69 425 25 360 133C250 150 180 215 162 340L25 345Z"
            fill="none"
            stroke={INK}
            strokeWidth="34"
            strokeLinejoin="round"
          />
          <path d="M70 345V440" fill="none" stroke={INK} strokeWidth="34" strokeLinecap="round" />
        </svg>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 800, letterSpacing: 2 }}>
            PORTFOLIO<span style={{ color: ACCENT }}>-VERSE</span>
          </div>
          <div style={{ display: "flex", fontSize: 40, lineHeight: 1.25, maxWidth: 680 }}>
            Your portfolio website, ready in ten minutes.
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {["Free", "No sign-up", "9 templates", "Download as HTML"].map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  padding: "10px 20px",
                  borderRadius: 999,
                  background: "#ffffff",
                  border: `2px solid ${ACCENT}`,
                  color: ACCENT,
                  fontSize: 24,
                  fontWeight: 600,
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}

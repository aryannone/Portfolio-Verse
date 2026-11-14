// The Portfolio-Verse mark: a graduate made of a cap, a round head and an open book for the legs.
// Every line has the same weight, so it stays clear from a browser tab up to a poster.
// The lines take the text colour around them; the head is always the brand purple.
// Each part is its own group, so the intro can animate the cap, head and legs separately.
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      className="logo-mark"
      viewBox="0 0 650 800"
      height={size}
      width={(size * 650) / 800}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="34" strokeLinejoin="round" strokeLinecap="round">
        {/* open book: the legs */}
        <g className="lm-leg lm-leg-l">
          <path d="M240 482H325L198 770 25 768Z" />
        </g>
        <g className="lm-leg lm-leg-r">
          <path d="M332 482H415L620 770H450Z" />
        </g>
      </g>
      {/* the head: a full circle */}
      <circle className="lm-head" cx="330" cy="312" r="138" fill="var(--accent, #8c52ff)" />
      {/* cap, with the curve where it sits on the head, and its tassel */}
      <g className="lm-cap" fill="none" stroke="currentColor" strokeWidth="34" strokeLinejoin="round" strokeLinecap="round">
        <path d="M155 69 425 25 360 133C250 150 180 215 162 340L25 345Z" />
        <path className="lm-tassel" d="M70 345V440" />
      </g>
    </svg>
  );
}

// The mark with the name beside it, as used in the header.
export default function Logo({ size = 44 }: { size?: number }) {
  return (
    <>
      <LogoMark size={size} />
      <span className="brand-text">
        PORTFOLIO<span className="brand-verse">VERSE</span>
      </span>
    </>
  );
}

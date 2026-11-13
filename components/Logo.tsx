// The Portfolio-Verse mark: a graduate made of a cap, a "D" for the head and an open book for the body.
// Every line has the same weight, so it stays clear from a browser tab up to a poster.
// The lines take the text colour around them; the "D" is always the brand purple.
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
        {/* cap, with the curve where it sits on the head, and its tassel */}
        <path d="M155 69 425 25 360 133C250 150 180 215 162 340L25 345Z" />
        <path d="M70 345V440" />
        {/* open book */}
        <path d="M240 482H325L198 770 25 768Z" />
        <path d="M332 482H415L620 770H450Z" />
      </g>
      {/* the D: a full-weight stem and a bowl that swells to the right */}
      <path
        fill="var(--accent, #8c52ff)"
        fillRule="evenodd"
        d="M236 150C385 160 462 236 462 318C462 402 388 456 292 470H236ZM270 212V436H290C334 426 366 392 366 334C366 268 328 218 270 212Z"
      />
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

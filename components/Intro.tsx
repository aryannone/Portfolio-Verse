"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/Logo";

// The opening animation, shown every time a page of the site is loaded or reloaded:
// the legs step in, the head drops onto them, the cap is tossed and lands, then the name is written out.
// It is drawn by the server and animated in CSS, so it plays before the page's scripts have loaded.
// It is never shown to people who ask for reduced motion. A tap or key press skips it.
const NAME = "PORTFOLIO";
const VERSE = "-VERSE";

export default function Intro() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const skip = () => root.classList.add("intro-skip");
    const done = window.setTimeout(() => setGone(true), 4200);
    window.addEventListener("pointerdown", skip, { once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.clearTimeout(done);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  if (gone) return null;
  let i = 0;
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-row">
        <div className="intro-mark">
          <LogoMark size={132} />
        </div>
        <div className="intro-name">
          {NAME.split("").map((ch) => (
            <span key={`n${i}`} style={{ ["--i" as string]: i++ }}>
              {ch}
            </span>
          ))}
          <span className="intro-verse">
            {VERSE.split("").map((ch) => (
              <span key={`v${i}`} style={{ ["--i" as string]: i++ }}>
                {ch}
              </span>
            ))}
          </span>
          <i className="intro-pen" />
        </div>
      </div>
    </div>
  );
}

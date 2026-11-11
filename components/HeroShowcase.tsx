"use client";

import { useEffect, useState } from "react";
import ScaledPreview from "@/components/ScaledPreview";
import { SAMPLES } from "@/lib/samples";

const ORDER = ["creative-4", "professional-4", "creative-1", "creative-5", "professional-2", "creative-3"];

// The hero's browser frame. It moves through real templates, scrolling down each one,
// pauses while the pointer is over it, and stays still if the visitor prefers less motion.
export default function HeroShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % ORDER.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  const id = ORDER[index];
  const sample = SAMPLES[id];

  return (
    <div
      className="browser"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="browser-bar">
        <div className="browser-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="browser-url">
          portfolio-verse.vercel.app/<strong>{sample.slug}</strong>
        </div>
      </div>
      <div key={id} className="scaled-swap">
        <ScaledPreview id={id} ratio="16 / 12" flat auto />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

export type BotMood = "idle" | "busy" | "done" | "error";

const LINES: Record<BotMood, string[]> = {
  idle: [
    "Hi! I'm Macmey. I read résumés for free, so I'm not a genius. I just look for patterns.",
    "Two-column résumés make me dizzy. Single-column ones I love.",
    "I never make things up. If it's wrong, I put a real line in the wrong box.",
    "Fun fact: I run entirely on your device. Your résumé never leaves it.",
    "My cousin is an expensive AI. I'm the budget version, but I try hard.",
  ],
  busy: ["Reading… squinting at your bullet points.", "Hmm, is this a date or a phone number?", "Sorting jobs from projects…"],
  done: ["Done! I did my best. Please check my work before anyone sees it.", "Finished. Peek at every step; I may have mixed a box or two."],
  error: ["That PDF is a picture, not text. I can't read pictures yet.", "I couldn't find any text in there. Typing it in will be quicker than waiting for me."],
};

// Macmey, a small robot that explains the résumé reader. Its eyes follow the pointer,
// tapping it brings a new line and a hop, and it acts out reading while a résumé is being read.
// "lines" replaces what Macmey says in this place, for uses other than the résumé reader.
export default function HelperBot({ mood = "idle", small = false, lines: own }: { mood?: BotMood; small?: boolean; lines?: string[] }) {
  const [line, setLine] = useState(0);
  const [hop, setHop] = useState(0);
  const root = useRef<HTMLButtonElement | null>(null);
  const eyes = useRef<(SVGCircleElement | null)[]>([]);

  // A new mood starts from its first line.
  useEffect(() => setLine(0), [mood]);

  // The pupils turn towards the pointer anywhere on the page.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const look = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const box = root.current?.querySelector("svg")?.getBoundingClientRect();
        if (!box) return;
        const dx = event.clientX - (box.left + box.width * 0.47);
        const dy = event.clientY - (box.top + box.height * 0.36);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(4, dist / 40);
        eyes.current.forEach((eye) => eye?.setAttribute("transform", `translate(${((dx / dist) * reach).toFixed(1)} ${((dy / dist) * reach).toFixed(1)})`));
      });
    };
    window.addEventListener("pointermove", look);
    return () => {
      window.removeEventListener("pointermove", look);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const lines = own && own.length ? own : LINES[mood];
  const said = lines[line % lines.length];

  return (
    <div className={`bot bot-${mood}${small ? " bot-small" : ""}`}>
      <button
        ref={root}
        type="button"
        className="bot-btn"
        aria-label="Macmey the résumé robot. Press for another tip."
        onClick={() => {
          setLine((n) => n + 1);
          setHop((n) => n + 1);
        }}
      >
        <svg key={hop} className={hop ? "bot-svg is-hop" : "bot-svg"} viewBox="0 0 120 120" aria-hidden="true">
          {/* the paper being read, with a highlight that sweeps down it while busy */}
          <g className="bot-paper">
            <rect x="70" y="40" width="40" height="52" rx="5" />
            <path d="M77 52h26M77 60h20M77 68h26M77 76h16" />
            <rect className="bot-scan" x="72" y="46" width="36" height="7" rx="3" />
          </g>
          {/* antenna, head and face */}
          <path className="bot-antenna" d="M44 18v-9" />
          <circle className="bot-tip" cx="44" cy="7" r="4.5" />
          <rect className="bot-head" x="14" y="18" width="60" height="48" rx="16" />
          <rect className="bot-face" x="22" y="28" width="44" height="28" rx="10" />
          <g className="bot-eyes">
            <circle cx="35" cy="42" r="5.2" fill="#fff" />
            <circle cx="53" cy="42" r="5.2" fill="#fff" />
            <circle ref={(el) => { eyes.current[0] = el; }} cx="35" cy="42" r="2.6" className="bot-pupil" />
            <circle ref={(el) => { eyes.current[1] = el; }} cx="53" cy="42" r="2.6" className="bot-pupil" />
          </g>
          <path className="bot-mouth" d={mood === "error" ? "M38 53q6-4 12 0" : "M38 50q6 5 12 0"} />
          {/* body and the arm holding a magnifying glass */}
          <rect className="bot-body" x="24" y="70" width="40" height="30" rx="10" />
          <path className="bot-arm" d="M62 80l12-6" />
          <g className="bot-glass">
            <circle cx="82" cy="70" r="10" />
            <path d="M75 77l-6 6" />
          </g>
          <path className="bot-legs" d="M34 100v10M54 100v10" />
        </svg>
      </button>
      <p className="bot-say" role="status" aria-live="polite">
        {said}
        <span className="bot-more" aria-hidden="true">
          {" "}
          (tap me)
        </span>
      </p>
    </div>
  );
}

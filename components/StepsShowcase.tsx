"use client";

import { useEffect, useRef, useState } from "react";
import { LogoMark } from "@/components/Logo";

type Step = { title: string; text: string };

// The landing page's "Four steps" band: a stage that acts out each step, the graduate from the logo
// reacting beside it, and the step list underneath lighting up in time.
// Steps advance on their own while the band is on screen (the active step's progress line drives it),
// pause while the visitor hovers or focuses inside, and can be picked by clicking.
// With reduced motion nothing moves: each step shows its finished scene as a still.
export default function StepsShowcase({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [held, setHeld] = useState(false);
  const [still, setStill] = useState(false);
  const [hop, setHop] = useState(0);
  const band = useRef<HTMLDivElement>(null);
  const mascot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = band.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // The graduate leans and looks toward the pointer (mouse and pen only).
  useEffect(() => {
    if (still || !inView || !window.matchMedia("(pointer: fine)").matches) return;
    const el = mascot.current;
    if (!el) return;
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2)));
        const y = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 3)) / (window.innerHeight / 2)));
        el.style.setProperty("--mx", x.toFixed(3));
        el.style.setProperty("--my", y.toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [still, inView]);

  const playing = inView && !held && !still;
  const next = () => setActive((i) => (i + 1) % steps.length);

  return (
    <div
      ref={band}
      className={`how${still ? " how-still" : playing ? "" : " is-paused"}`}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      // Keyboard focus pauses it (so a step can be read); a mouse click on a step does not.
      onFocus={(e) => {
        if ((e.target as HTMLElement).matches(":focus-visible")) setHeld(true);
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHeld(false);
      }}
    >
      <div className="how-top">
        <div className="how-mascot" ref={mascot}>
          <button
            type="button"
            className="how-mascot-btn"
            aria-label="Make the graduate jump"
            onClick={() => setHop((n) => n + 1)}
          >
            <span key={`hop${hop}`} className={hop ? "how-hop is-hop" : "how-hop"}>
              <span key={`step${active}`} className={`how-react how-react-${active + 1}`}>
                <LogoMark size={190} />
              </span>
            </span>
          </button>
          <span className="how-shadow" aria-hidden="true" />
        </div>

        <div className="how-stage" aria-hidden="true">
          <Scene key={active} index={active} />
        </div>
      </div>

      {/* The list rises in as one piece: React rewrites each step's classes as it becomes active. */}
      <ol className="steps how-steps" data-reveal>
        {steps.map((step, i) => (
          <li
            key={step.title}
            className={`step${i === active ? " is-active" : ""}`}
          >
            <button type="button" className="how-pick" aria-current={i === active ? "step" : undefined} onClick={() => setActive(i)}>
              <span className="step-num" aria-hidden="true">
                {i + 1}
              </span>
              <span className="step-title">{step.title}</span>
              <span className="step-text">{step.text}</span>
            </button>
            {i === active && !still ? <span key={`bar${active}`} className="how-bar" onAnimationEnd={next} aria-hidden="true" /> : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

// A small browser window, the way the product looks.
function Window({ children, url = "portfolio-verse" }: { children: React.ReactNode; url?: string }) {
  return (
    <div className="hs-win">
      <div className="hs-win-bar">
        <i />
        <i />
        <i />
        <span>{url}</span>
      </div>
      <div className="hs-win-body">{children}</div>
    </div>
  );
}

function Pointer({ className }: { className: string }) {
  return (
    <svg className={`hs-pointer ${className}`} viewBox="0 0 24 24" width="26" height="26">
      <path d="M4 2l16 9-7 2-3 7z" fill="#12141a" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function Scene({ index }: { index: number }) {
  if (index === 0) {
    // 1. Start building: the pointer glides to the button and presses it.
    return (
      <div className="hs hs-1">
        <Window>
          <div className="hs-lines">
            <b style={{ width: "70%" }} />
            <b style={{ width: "52%" }} />
            <i style={{ width: "80%" }} />
          </div>
          <div className="hs-start">
            Start building
            <span className="hs-ring" />
          </div>
          <span className="hs-spark hs-spark-a" />
          <span className="hs-spark hs-spark-b" />
          <span className="hs-spark hs-spark-c" />
        </Window>
        <Pointer className="hs-pointer-1" />
      </div>
    );
  }
  if (index === 1) {
    // 2. Fill in your details: the name and role type in, and a photo drops into place.
    return (
      <div className="hs hs-2">
        <Window url="portfolio-verse/start">
          <div className="hs-form">
            <div className="hs-photo">
              <span className="hs-face">
                <i />
                <b />
              </span>
            </div>
            <div className="hs-fields">
              <label>Name</label>
              <div className="hs-field">
                <span className="hs-type hs-type-1">Priya Nair</span>
              </div>
              <label>What you do</label>
              <div className="hs-field">
                <span className="hs-type hs-type-2">Data Analyst</span>
              </div>
            </div>
          </div>
        </Window>
      </div>
    );
  }
  if (index === 2) {
    // 3. Pick a template: three cards fan out, one is chosen and grows with the name in it.
    return (
      <div className="hs hs-3">
        <div className="hs-cards">
          <div className="hs-card hs-card-a">
            <b />
            <i />
            <i />
          </div>
          <div className="hs-card hs-card-b">
            <b />
            <i />
            <i />
          </div>
          <div className="hs-card hs-card-c">
            <span className="hs-card-name">Priya Nair</span>
            <i />
            <i />
          </div>
        </div>
        <Pointer className="hs-pointer-3" />
      </div>
    );
  }
  // 4. Download: the file flies into the tray, a tick, then "ready to host".
  return (
    <div className="hs hs-4">
      <Window>
        <div className="hs-lines">
          <b style={{ width: "58%" }} />
          <i style={{ width: "76%" }} />
          <i style={{ width: "64%" }} />
        </div>
        <div className="hs-dl">Download HTML</div>
      </Window>
      <div className="hs-file">
        <span>&lt;/&gt;</span>
        portfolio.html
      </div>
      <div className="hs-tray">
        <svg viewBox="0 0 24 24" width="22" height="22" className="hs-tray-icon">
          <path d="M12 4v10m-4-4 4 4 4-4M5 19h14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <svg viewBox="0 0 24 24" width="22" height="22" className="hs-tick">
          <path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div className="hs-live">
        <i />
        Ready to host anywhere
      </div>
    </div>
  );
}

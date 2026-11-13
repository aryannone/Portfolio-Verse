"use client";

import { useEffect, useMemo, useState } from "react";
import ScaledPreview from "@/components/ScaledPreview";
import { fromSample, slugOf } from "@/lib/portfolio";
import { getTemplate } from "@/lib/templates";

const ORDER = [
  "creative-4",
  "professional-4",
  "creative-1",
  "professional-2",
  "creative-5",
  "professional-1",
  "split",
  "bento",
];

// The hero's browser frame, and a way to try the product on the spot:
// type a name and it appears in the template; tap a dot to see another template.
// Until the visitor does either, it moves through the templates by itself.
export default function HeroShowcase() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // The visitor's own choice: the pause button, typing a name or picking a template.
  const [stopped, setStopped] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    if (paused || stopped) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % ORDER.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused, stopped]);

  const id = ORDER[index];
  const typed = name.trim();
  const data = useMemo(() => {
    const sample = fromSample(id);
    return typed ? { ...sample, name: typed } : sample;
  }, [id, typed]);

  return (
    <div className="hero-try">
      <div
        className={stopped ? "browser is-stopped" : "browser"}
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
            <strong>{slugOf(data.name)}</strong>.html
          </div>
          <button
            type="button"
            className="browser-pause"
            aria-label={stopped ? "Play the template slideshow" : "Pause the template slideshow"}
            aria-pressed={stopped}
            onClick={() => setStopped((v) => !v)}
          >
            <span aria-hidden="true">{stopped ? "▶" : "❚❚"}</span>
          </button>
        </div>
        <div key={id} className="scaled-swap">
          {/* While a name is being typed the picture stays at the top, where the name is. */}
          <ScaledPreview id={id} ratio="16 / 12" flat auto={!stopped} data={data} exact />
        </div>
      </div>

      <div className="try">
        <label className="try-name">
          <span>Try it: type your name</span>
          <input
            className="ed-input"
            value={name}
            maxLength={40}
            placeholder="Your name"
            autoComplete="off"
            onFocus={() => setStopped(true)}
            onChange={(e) => {
              setStopped(true);
              setName(e.target.value);
            }}
          />
        </label>
        <div className="try-pick">
          <span id="try-pick-label">
            Template: <strong>{getTemplate(id)?.name}</strong>
          </span>
          <div className="try-dots" role="group" aria-labelledby="try-pick-label">
            {ORDER.map((templateId, i) => {
              const template = getTemplate(templateId);
              return (
                <button
                  key={templateId}
                  type="button"
                  className={i === index ? "try-dot is-on" : "try-dot"}
                  style={{ background: template?.accent }}
                  aria-label={template?.name}
                  aria-pressed={i === index}
                  title={template?.name}
                  onClick={() => {
                    setStopped(true);
                    setIndex(i);
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

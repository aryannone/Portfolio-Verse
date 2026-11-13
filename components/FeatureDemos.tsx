"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ACCENTS, fromSample, linkBadge, onColor, type SectionStyle } from "@/lib/portfolio";
import { mountPortfolio, type RuntimeStore } from "@/lib/runtime";

// Three small working pieces of a real portfolio, shown on the home page.
// They use the same styles and the same script as a finished portfolio, so what a visitor tries here is the real thing.

const STYLES: { id: SectionStyle; name: string }[] = [
  { id: "outline", name: "Outlined" },
  { id: "filled", name: "Soft" },
  { id: "colour", name: "Colour" },
  { id: "sticker", name: "Sticker" },
];

const LINKS = [
  { label: "Email", url: "mailto:" },
  { label: "LinkedIn", url: "linkedin" },
  { label: "GitHub", url: "github" },
  { label: "Instagram", url: "instagram" },
];

// A piece of a portfolio page, with the portfolio script running on it.
function Piece({ children, store, accent, className = "" }: { children: ReactNode; store?: RuntimeStore; accent: string; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const storeRef = useRef<RuntimeStore>(store ?? { items: {} });

  useEffect(() => {
    if (!ref.current) return;
    return mountPortfolio(ref.current, storeRef.current, { reveal: false });
  }, []);

  return (
    <div
      ref={ref}
      className={`tp tp-custom tp-live tp-font-modern demo-piece ${className}`}
      style={{ "--tp-accent": accent, "--tp-on-accent": onColor(accent) } as CSSProperties}
    >
      {children}
    </div>
  );
}

export default function FeatureDemos() {
  const [style, setStyle] = useState<SectionStyle>("sticker");
  const [accent, setAccent] = useState("#8c52ff");

  // Two sample projects, with their pictures and write-ups.
  const entries = useMemo(() => fromSample("professional-4").sections[0].items.slice(0, 2), []);
  const store = useMemo<RuntimeStore>(() => {
    const items: RuntimeStore["items"] = {};
    entries.forEach((entry, i) => {
      items[`demo:${entry.id}`] = {
        section: "Projects",
        title: entry.title,
        sub: "",
        text: entry.text,
        details: entry.details ?? "",
        tags: entry.tags,
        links: [],
        layout: i === 0 ? "mosaic" : "slides",
        photos: entry.photos,
      };
    });
    return { items };
  }, [entries]);

  const cards = (clickable: boolean) =>
    entries.map((entry) => (
      <div
        key={entry.id}
        className={clickable ? "tp-card tp-item has-more" : "tp-card tp-item"}
        {...(clickable ? { "data-item": `demo:${entry.id}`, tabIndex: 0, role: "button", "aria-label": `${entry.title}. See details` } : {})}
      >
        <div className="tp-shot">
          <img src={entry.photos[0]} alt="" />
          {clickable ? <span className="tp-count">{entry.photos.length} photos</span> : null}
        </div>
        <strong>{entry.title}</strong>
        <p>{entry.text}</p>
        {clickable ? <span className="tp-more">See details</span> : null}
      </div>
    ));

  return (
    <div className="demos">
      <article className="demo-row" data-reveal>
        <div className="demo-copy">
          <h3 className="display">Tap an entry, get the whole story.</h3>
          <p>
            Every project, job or course can carry photos, links and a full write-up. Visitors tap it and a panel
            slides in, from the side on a laptop and from the bottom on a phone.
          </p>
          <p className="demo-hint">Try it: tap a card.</p>
        </div>
        <div className="demo-box">
          <Piece store={store} accent="#8c52ff">
            <div className="tp-sec tp-cards">
              <div className="tp-grid tp-n-2">{cards(true)}</div>
            </div>
          </Piece>
        </div>
      </article>

      <article className="demo-row is-flipped" data-reveal>
        <div className="demo-copy">
          <h3 className="display">Change the look of any section.</h3>
          <p>
            Pick a template, then make it yours. Card styles, colours, fonts and backgrounds can be set for the whole
            page or for one section, and a style from one template works in any other.
          </p>
          <div className="demo-controls">
            <div className="ed-seg" role="group" aria-label="Card style">
              {STYLES.map((s) => (
                <button key={s.id} type="button" aria-pressed={style === s.id} onClick={() => setStyle(s.id)}>
                  {s.name}
                </button>
              ))}
            </div>
            <div className="ed-swatches" role="group" aria-label="Colour">
              {["#8c52ff", ...ACCENTS.slice(0, 5)].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={accent === c ? "ed-swatch is-on" : "ed-swatch"}
                  style={{ background: c }}
                  aria-label={`Colour ${c}`}
                  aria-pressed={accent === c}
                  onClick={() => setAccent(c)}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="demo-box">
          <Piece accent={accent}>
            <div className={`tp-sec tp-cards tp-v tp-v-${style}`}>
              <div className="tp-h" style={{ color: accent === "#ffd43b" ? undefined : "var(--tp-accent)" }}>
                Projects
              </div>
              <div className="tp-grid tp-n-2">{cards(false)}</div>
            </div>
          </Piece>
        </div>
      </article>

      <article className="demo-row" data-reveal>
        <div className="demo-copy">
          <h3 className="display">A contact section people play with.</h3>
          <p>
            Your email and social links float as bubbles. Visitors can drag them, throw them and tap one to open it,
            while a little character keeps an eye on the pointer. Prefer it plain? One switch turns it into a neat row.
          </p>
          <p className="demo-hint">Try it: throw a bubble, then tap the robot.</p>
        </div>
        <div className="demo-box">
          <Piece accent="#8c52ff" className="demo-play">
            <div className="tp-sec tp-contact">
              <div className="tp-play">
                {LINKS.map((link) => (
                  // These go nowhere: on a real portfolio each one opens the person's own link.
                  <a key={link.label} className="tp-bub" href="#features" aria-label={`${link.label} (example)`} onClick={(e) => e.preventDefault()}>
                    <b aria-hidden="true">{linkBadge(link.label, link.url)}</b>
                    <span>{link.label}</span>
                  </a>
                ))}
                <div className="tp-buddy tp-buddy-robot" aria-hidden="true">
                  <span className="tp-buddy-eye">
                    <i />
                  </span>
                  <span className="tp-buddy-eye">
                    <i />
                  </span>
                  <span className="tp-buddy-mouth" />
                </div>
              </div>
            </div>
          </Piece>
        </div>
      </article>
    </div>
  );
}

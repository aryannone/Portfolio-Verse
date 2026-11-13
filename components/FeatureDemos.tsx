"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import ContactBlock from "@/components/ContactBlock";
import { ACCENTS, fromSample, onColor, samplePortrait, type Portfolio, type SectionStyle } from "@/lib/portfolio";
import { mountPortfolio, type RuntimeStore } from "@/lib/runtime";

// Three small working pieces of a real portfolio, shown on the home page.
// They use the same styles and the same script as a finished portfolio, so what a visitor tries here is the real thing.

const STYLES: { id: SectionStyle; name: string }[] = [
  { id: "outline", name: "Outlined" },
  { id: "filled", name: "Soft" },
  { id: "colour", name: "Colour" },
  { id: "sticker", name: "Sticker" },
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

  // A sample person for the contact demo, with a drawn portrait standing in for a photo.
  const contact = useMemo<Portfolio>(
    () => ({ ...fromSample("professional-4"), photo: samplePortrait("#8c52ff"), portrait: "plain", contactStatus: "Open to internships" }),
    [],
  );

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
          <h3 className="display">A contact section with presence.</h3>
          <p>
            Your headline, your email with one-tap copy, your links, and your portrait on a card that leans towards
            the pointer. Your photo can be shown as it is, as a flat drawn-style poster, or as a two-colour print.
          </p>
          <p className="demo-hint">Try it: move your pointer over the card.</p>
        </div>
        {/* The links in this example lead nowhere, so taps on them are swallowed. */}
        <div
          className="demo-box"
          onClickCapture={(e) => {
            if ((e.target as HTMLElement).closest("a")) e.preventDefault();
          }}
        >
          <Piece accent="#8c52ff" className="demo-contact">
            <ContactBlock data={contact} />
          </Piece>
        </div>
      </article>
    </div>
  );
}

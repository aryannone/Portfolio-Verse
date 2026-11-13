"use client";

import { useEffect, useId, useRef, type CSSProperties, type Ref } from "react";
import { initialsOf, onColor, toHref, type Item, type Link, type Portfolio, type Section } from "@/lib/portfolio";
import { mountPortfolio, type RuntimeStore } from "@/lib/runtime";
import { getTemplate } from "@/lib/templates";
import ContactBlock from "@/components/ContactBlock";

type Props = {
  data: Portfolio;
  // Play the hero entrance when the view appears.
  animate?: boolean;
  // Let visitors open the photo panel. Off for the small pictures of templates.
  interactive?: boolean;
  // Sections rise in while scrolling. Used on full pages, not while editing.
  reveal?: boolean;
  // Use real headings. Off when the view is only a picture inside another page.
  semantic?: boolean;
  rootRef?: Ref<HTMLDivElement>;
};

function subLine(item: Item) {
  return [item.sub, item.meta].filter(Boolean).join(" · ");
}

function usable(links: Link[] | undefined) {
  return (links ?? []).filter((link) => link.url.trim()).map((link) => ({ ...link, label: link.label.trim() || "Link", url: toHref(link.url) }));
}

function photoLabel(count: number) {
  return count === 1 ? "1 photo" : `${count} photos`;
}

// A whole portfolio page in the look of its template.
// The markup is the same for every template; public/portfolio.css gives each its own layout.
export default function PortfolioView({ data, animate, interactive, reveal, semantic, rootRef }: Props) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const store = useRef<RuntimeStore>({ items: {} });

  const moves = data.motion !== "none";

  // The five tones of the poster portrait, dark to light, mixed from the accent colour.
  // Each portfolio on a page gets its own filter, because each can have its own accent.
  const toonId = `tp-toon-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const accentHex = /^#[0-9a-f]{6}$/i.test(data.accent) ? data.accent : getTemplate(data.template)?.accent ?? "#8c52ff";
  const accentRgb = [1, 3, 5].map((at) => parseInt(accentHex.slice(at, at + 2), 16) / 255);
  const tones = (channel: number) => {
    const c = accentRgb[channel];
    const dark = [0.08, 0.06, 0.14][channel];
    const light = [1, 0.98, 0.95][channel];
    const mix = (from: number, to: number, t: number) => from + (to - from) * t;
    return [dark, mix(dark, c, 0.6), c, mix(c, light, 0.6), light].map((v) => v.toFixed(3)).join(" ");
  };
  const Name = semantic ? "h1" : "div";
  const Heading = semantic ? "h2" : "div";
  const sections = data.sections.filter((s) => !s.hidden && (s.layout === "skills" ? data.skills.length > 0 : s.items.length > 0));

  // A section's own colours and font, when the user has set any.
  const look = (section: Section) => {
    const style: Record<string, string> = {};
    if (section.bg) style["--tp-bg"] = section.bg;
    if (section.ink || section.bg) style["--tp-ink"] = section.ink || onColor(section.bg ?? "");
    if (section.accent) {
      style["--tp-accent"] = section.accent;
      style["--tp-on-accent"] = onColor(section.accent);
    }
    const classes = [
      section.bg ? "tp-sec-bg" : "",
      section.bg || section.ink ? "tp-sec-ink" : "",
      section.font ? `tp-sf-${section.font}` : "",
      section.style ? `tp-v tp-v-${section.style}` : "",
    ].filter(Boolean);
    return { extra: classes.length ? ` ${classes.join(" ")}` : "", style: style as CSSProperties };
  };

  // Skills are a section like any other, placed wherever the user moved them.
  // Professional 2 is the exception: its design keeps them in the side panel.
  const inSide = data.template === "professional-2";
  const skills = (section: Section, place: "side" | "main") => (
    <div key={section.id} className={`tp-sec tp-skills tp-skills-${place}${look(section).extra}`} style={look(section).style}>
      <Heading className="tp-h">{section.title}</Heading>
      <div className="tp-chips">
        {data.skills.map((skill, i) => (
          <span key={i}>{skill}</span>
        ))}
      </div>
    </div>
  );
  const skillsSection = sections.find((s) => s.layout === "skills");

  const external = (url: string) => (/^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

  const entryLinks = (item: Item) =>
    usable(item.links).length ? (
      <div className="tp-elinks">
        {usable(item.links).map((link) => (
          <a key={link.id} href={link.url} {...external(link.url)}>
            {link.label}
          </a>
        ))}
      </div>
    ) : null;

  const items: RuntimeStore["items"] = {};
  for (const section of sections) {
    for (const item of section.items) {
      items[`${section.id}:${item.id}`] = {
        section: section.title,
        title: item.title,
        sub: subLine(item),
        text: item.text,
        details: item.details ?? "",
        tags: item.tags,
        links: usable(item.links).map(({ label, url }) => ({ label, url })),
        layout: item.gallery || data.gallery,
        photos: item.photos,
      };
    }
  }
  store.current.items = items;

  useEffect(() => {
    if (!interactive || !localRef.current) return;
    return mountPortfolio(localRef.current, store.current, { reveal: reveal && moves });
  }, [interactive, reveal, moves]);

  const setRef = (node: HTMLDivElement | null) => {
    localRef.current = node;
    if (typeof rootRef === "function") rootRef(node);
    else if (rootRef) (rootRef as { current: HTMLDivElement | null }).current = node;
  };

  const style = data.accent
    ? ({ "--tp-accent": data.accent, "--tp-on-accent": onColor(data.accent) } as CSSProperties)
    : undefined;


  const itemProps = (section: Section, item: Item, base: string) => {
    // An entry opens the details panel when it has photos or a full write-up to show.
    const has = item.photos.length > 0 || Boolean(item.details?.trim());
    return {
      className: `${base} tp-item${has ? " has-more" : ""}`,
      "data-item": `${section.id}:${item.id}`,
      ...(has && interactive
        ? { tabIndex: 0, role: "button", "aria-label": `${item.title}. See details` }
        : {}),
    };
  };

  return (
    <div
      ref={setRef}
      className={[
        "tp",
        interactive ? "tp-live" : "",
        `tp-${data.template}`,
        `tp-font-${data.font}`,
        `tp-m-${data.motion}`,
        data.theme ? `tp-th-${data.theme}` : "",
        data.hero ? `tp-hero-${data.hero}` : "",
        data.photoSize !== "m" ? `tp-av-${data.photoSize}` : "",
        data.frame ? `tp-fr-${data.frame}` : "",
        data.bodyFont !== "clean" ? `tp-bf-${data.bodyFont}` : "",
        data.bigName ? "tp-name-xl" : "",
        data.glow ? "tp-fx-glow" : "",
        animate && moves ? "tp-enter" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {data.progress && interactive ? <div className="tp-progress" aria-hidden="true" /> : null}
      {/* The "poster" portrait effect: the photo is reduced to five flat tones of the accent colour, like a screen print. */}
      <svg className="tp-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id={toonId} colorInterpolationFilters="sRGB">
          <feColorMatrix type="saturate" values="0" />
          <feGaussianBlur stdDeviation="0.9" />
          <feComponentTransfer>
            <feFuncR type="discrete" tableValues={tones(0)} />
            <feFuncG type="discrete" tableValues={tones(1)} />
            <feFuncB type="discrete" tableValues={tones(2)} />
          </feComponentTransfer>
        </filter>
      </svg>
      <div className="tp-bg" aria-hidden="true" />
      <div className="tp-in">
        <div className="tp-side">
          <div className="tp-hero">
            <div className="tp-avatar">
              {data.photo ? <img src={data.photo} alt={data.name} /> : <span aria-hidden="true">{initialsOf(data.name)}</span>}
            </div>
            {data.role || data.city ? (
              <div className="tp-tags">
                {data.role ? <span>{data.role}</span> : null}
                {data.city ? <span>{data.city}</span> : null}
              </div>
            ) : null}
            <Name className="tp-name">{data.name || "Your Name"}</Name>
            {data.bio ? <p className="tp-bio">{data.bio}</p> : null}
            <div className="tp-links">
              {data.email ? (
                <a className="tp-cta" href={`mailto:${data.email}`}>
                  Contact me
                </a>
              ) : null}
              {data.links
                .filter((link) => link.label)
                .map((link) =>
                  link.url.trim() ? (
                    <a key={link.id} href={toHref(link.url)} {...external(toHref(link.url))}>
                      {link.label}
                    </a>
                  ) : (
                    <span key={link.id}>{link.label}</span>
                  ),
                )}
            </div>
          </div>

          {skillsSection && inSide ? skills(skillsSection, "side") : null}
        </div>

        <div className="tp-main">
          {data.about ? (
            <div className="tp-sec tp-about">
              <Heading className="tp-h">About</Heading>
              <p>{data.about}</p>
            </div>
          ) : null}

          {sections.map((section) =>
            section.layout === "skills" ? (
              inSide ? null : skills(section, "main")
            ) : section.layout === "cards" ? (
              <div key={section.id} className={`tp-sec tp-cards${look(section).extra}`} style={look(section).style}>
                <Heading className="tp-h">{section.title}</Heading>
                <div className={`tp-grid tp-n-${Math.min(section.items.length, 9)}`}>
                  {section.items.map((item) => (
                    <div key={item.id} {...itemProps(section, item, "tp-card")}>
                      {item.photos.length ? (
                        <div className="tp-shot">
                          <img src={item.photos[0]} alt="" />
                          <span className="tp-count">{photoLabel(item.photos.length)}</span>
                        </div>
                      ) : null}
                      <strong>{item.title}</strong>
                      {subLine(item) ? <div className="tp-place">{subLine(item)}</div> : null}
                      {item.text ? <p>{item.text}</p> : null}
                      {item.tags.length ? (
                        <div className="tp-chips">
                          {item.tags.map((tag, i) => (
                            <span key={i}>{tag}</span>
                          ))}
                        </div>
                      ) : null}
                      {entryLinks(item)}
                      {item.photos.length || item.details?.trim() ? <span className="tp-more">See details</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div key={section.id} className={`tp-sec tp-list${look(section).extra}`} style={look(section).style}>
                <Heading className="tp-h">{section.title}</Heading>
                <div className="tp-rows">
                  {section.items.map((item) => (
                    <div key={item.id} {...itemProps(section, item, "tp-row")}>
                      <div className="tp-row-main">
                        <strong>{item.title}</strong>
                        {item.sub ? <div className="tp-place">{item.sub}</div> : null}
                        {item.text ? <p>{item.text}</p> : null}
                        {item.tags.length ? (
                          <div className="tp-chips" style={{ marginTop: 8 }}>
                            {item.tags.map((tag, i) => (
                              <span key={i}>{tag}</span>
                            ))}
                          </div>
                        ) : null}
                        {entryLinks(item)}
                        {!item.photos.length && item.details?.trim() ? <span className="tp-more">See details</span> : null}
                      </div>
                      {item.meta ? <span className="tp-years">{item.meta}</span> : null}
                      {item.photos.length ? (
                        <div className="tp-thumbs">
                          {item.photos.slice(0, 3).map((photo, i) => (
                            <img key={i} src={photo} alt="" />
                          ))}
                          <span className="tp-more">See details</span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          {data.quote.trim() ? (
            <div className="tp-sec tp-quote">
              <blockquote>
                <p>{data.quote.trim()}</p>
                {data.quoteBy.trim() ? <footer>{data.quoteBy.trim()}</footer> : null}
              </blockquote>
            </div>
          ) : null}

          <ContactBlock data={data} semantic={semantic} toonId={toonId} />
        </div>
      </div>
    </div>
  );
}

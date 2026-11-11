"use client";

import { useEffect, useRef, type CSSProperties, type Ref } from "react";
import { initialsOf, onColor, type Item, type Portfolio, type Section } from "@/lib/portfolio";
import { mountPortfolio, type RuntimeStore } from "@/lib/runtime";

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

function photoLabel(count: number) {
  return count === 1 ? "1 photo" : `${count} photos`;
}

// A whole portfolio page in the look of its template.
// The markup is the same for every template; public/portfolio.css gives each its own layout.
export default function PortfolioView({ data, animate, interactive, reveal, semantic, rootRef }: Props) {
  const localRef = useRef<HTMLDivElement | null>(null);
  const store = useRef<RuntimeStore>({ items: {} });

  const moves = data.motion !== "none";
  const sections = data.sections.filter((s) => !s.hidden && s.items.length > 0);

  const items: RuntimeStore["items"] = {};
  for (const section of sections) {
    for (const item of section.items) {
      items[`${section.id}:${item.id}`] = {
        title: item.title,
        sub: subLine(item),
        text: item.text,
        tags: item.tags,
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

  const Name = semantic ? "h1" : "div";
  const Heading = semantic ? "h2" : "div";

  const itemProps = (section: Section, item: Item, base: string) => {
    const has = item.photos.length > 0;
    return {
      className: `${base} tp-item${has ? " has-photos" : ""}`,
      "data-item": `${section.id}:${item.id}`,
      ...(has && interactive
        ? { tabIndex: 0, role: "button", "aria-label": `${item.title}. View ${photoLabel(item.photos.length)}` }
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
        data.bigName ? "tp-name-xl" : "",
        data.glow ? "tp-fx-glow" : "",
        animate && moves ? "tp-enter" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
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
                  link.url ? (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer">
                      {link.label}
                    </a>
                  ) : (
                    <span key={link.id}>{link.label}</span>
                  ),
                )}
            </div>
          </div>

          {data.skills.length ? (
            <div className="tp-sec tp-skills">
              <Heading className="tp-h">Skills</Heading>
              <div className="tp-chips">
                {data.skills.map((skill, i) => (
                  <span key={i}>{skill}</span>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="tp-main">
          {data.about ? (
            <div className="tp-sec tp-about">
              <Heading className="tp-h">About</Heading>
              <p>{data.about}</p>
            </div>
          ) : null}

          {sections.map((section) =>
            section.layout === "cards" ? (
              <div key={section.id} className={`tp-sec tp-cards${section.style ? ` tp-v tp-v-${section.style}` : ""}`}>
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
                      {item.photos.length ? <span className="tp-more">View photos</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div key={section.id} className={`tp-sec tp-list${section.style ? ` tp-v tp-v-${section.style}` : ""}`}>
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
                      </div>
                      {item.meta ? <span className="tp-years">{item.meta}</span> : null}
                      {item.photos.length ? (
                        <div className="tp-thumbs">
                          {item.photos.slice(0, 3).map((photo, i) => (
                            <img key={i} src={photo} alt="" />
                          ))}
                          <span className="tp-more">View {photoLabel(item.photos.length)}</span>
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}

          {data.email ? (
            <div className="tp-sec tp-contact">
              <Heading className="tp-h">Contact</Heading>
              <p>
                <a href={`mailto:${data.email}`}>{data.email}</a>
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

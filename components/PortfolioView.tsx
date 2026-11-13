"use client";

import { useEffect, useRef, type CSSProperties, type Ref } from "react";
import { initialsOf, onColor, toHref, type Item, type Link, type Portfolio, type Section } from "@/lib/portfolio";
import { mountPortfolio, type RuntimeStore } from "@/lib/runtime";
import ContactBlock from "@/components/ContactBlock";
import { resumeFileName } from "@/lib/resumePdf";

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

// Splits text into words that can arrive one after another. The spaces stay as plain text.
function words(text: string) {
  let n = 0;
  return text.split(/(\s+)/).map((part, i) =>
    /^\s+$/.test(part) || !part ? (
      part
    ) : (
      <span key={i} className="tp-w" style={{ "--w": n++ } as CSSProperties}>
        {part}
      </span>
    ),
  );
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

  // The "Download résumé" button: only the user's own résumé file, and only when there is one.
  const cv = data.resume !== "none" && data.resumeFile ? data.resumeFile : "";
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
    <div key={section.id} id={place === "main" ? anchor(section.id) : undefined} className={`tp-sec tp-skills tp-skills-${place}${look(section).extra}`} style={look(section).style}>
      <Heading className="tp-h">{section.title}</Heading>
      <div className="tp-chips">
        {data.skills.map((skill, i) => (
          <span key={i} style={{ "--c": i } as CSSProperties}>{skill}</span>
        ))}
      </div>
    </div>
  );
  const skillsSection = sections.find((s) => s.layout === "skills");

  // The links in the navigation bar, one per section that is shown, in page order.
  const anchor = (id: string) => `tp-s-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const hasContact = Boolean(data.email || data.phone.trim() || data.links.some((l) => l.url.trim()));
  const navLinks = [
    ...(data.about ? [{ href: "#tp-about", label: "About" }] : []),
    ...sections
      .filter((section) => !(section.layout === "skills" && data.template === "professional-2"))
      .map((section) => ({ href: `#${anchor(section.id)}`, label: section.title || "Section" })),
    ...(hasContact ? [{ href: "#tp-contact", label: "Contact" }] : []),
  ];
  // Only on full pages: the small pictures of templates have no use for it.
  const showNav = data.nav && interactive && navLinks.length > 1;

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
        result: item.result ?? "",
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

  const style = {
    ...(data.accent ? { "--tp-accent": data.accent, "--tp-on-accent": onColor(data.accent) } : {}),
    // The point of the user's photo that every frame keeps in view.
    ...(data.photoFocus ? { "--tp-focus": data.photoFocus } : {}),
  } as CSSProperties;


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

  // The Case study template tells each entry of a card section as a full-screen chapter.
  const chapters = (section: Section) => {
    const items = section.items;
    const total = String(items.length).padStart(2, "0");
    return (
      <div key={section.id} id={anchor(section.id)} className={`tp-sec tp-cards tp-chapters${look(section).extra}`} style={look(section).style}>
        <Heading className="tp-h">{section.title}</Heading>
        {items.map((item, i) => {
          const points = (item.details ?? "")
            .split(/\n+/)
            .map((p) => p.replace(/^\s*[\u2022\-*\u2013]\s*/, "").trim())
            .filter(Boolean);
          const key = `${section.id}:${item.id}`;
          const photosLabel = `${item.title}. View ${photoLabel(item.photos.length)}`;
          return (
            <article key={item.id} className="tp-chapter">
              {item.photos.length ? (
                <button type="button" className="tp-ch-media tp-item has-more" data-item={key} aria-label={photosLabel} tabIndex={interactive ? 0 : -1}>
                  <img src={item.photos[0]} alt="" />
                  {item.photos.length > 1 ? <span className="tp-count">{photoLabel(item.photos.length)}</span> : null}
                </button>
              ) : (
                <div className="tp-ch-media is-empty" aria-hidden="true">
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
              )}
              <div className="tp-ch-body">
                <span className="tp-ch-num">
                  {String(i + 1).padStart(2, "0")} / {total}
                </span>
                <h3 className="tp-ch-title">{item.title}</h3>
                {subLine(item) ? <div className="tp-place">{subLine(item)}</div> : null}
                {item.tags.length ? (
                  <div className="tp-chips">
                    {item.tags.map((tag, t) => (
                      <span key={t}>{tag}</span>
                    ))}
                  </div>
                ) : null}
                {item.text ? (
                  <div className="tp-ch-block">
                    <span className="tp-ch-label">The problem</span>
                    <p>{item.text}</p>
                  </div>
                ) : null}
                {points.length ? (
                  <div className="tp-ch-block">
                    <span className="tp-ch-label">What I did</span>
                    <ul>
                      {points.map((p, n) => (
                        <li key={n}>{p}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {item.result?.trim() ? (
                  <div className="tp-ch-result">
                    <span className="tp-ch-label">The result</span>
                    <p>{item.result.trim()}</p>
                  </div>
                ) : null}
                {entryLinks(item)}
                {item.photos.length > 1 ? (
                  <button type="button" className="tp-ch-more tp-item has-more" data-item={key} tabIndex={interactive ? 0 : -1}>
                    View all {photoLabel(item.photos.length)}
                  </button>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    );
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
        showNav ? "tp-has-nav" : "",
        animate && moves ? "tp-enter" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {showNav ? (
        <nav className="tp-nav" aria-label="Sections">
          <a className="tp-nav-name" href="#tp-top">
            {data.name || "Your Name"}
          </a>
          <div className="tp-nav-links">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </div>
          {data.progress ? <div className="tp-progress" aria-hidden="true" /> : null}
        </nav>
      ) : data.progress && interactive ? (
        <div className="tp-progress tp-progress-solo" aria-hidden="true" />
      ) : null}
      <div className="tp-bg" aria-hidden="true" />
      <div className="tp-in">
        <div className="tp-side">
          <div className="tp-hero" id="tp-top">
            <div className="tp-avatar">
              {data.photo ? <img src={data.photo} alt={data.name} /> : <span aria-hidden="true">{initialsOf(data.name)}</span>}
            </div>
            {data.role || data.city ? (
              <div className="tp-tags">
                {data.role ? <span>{data.role}</span> : null}
                {data.city ? <span>{data.city}</span> : null}
              </div>
            ) : null}
            <Name className="tp-name">{words(data.name || "Your Name")}</Name>
            {data.bio ? <p className="tp-bio">{words(data.bio)}</p> : null}
            <div className="tp-links">
              {data.email ? (
                <a className="tp-cta" href={`mailto:${data.email}`}>
                  Contact me
                </a>
              ) : null}
              {cv ? (
                <a className="tp-cv" href={cv} download={data.resumeName || resumeFileName(data)}>
                  Download résumé
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
            <div className="tp-sec tp-about" id="tp-about">
              <Heading className="tp-h">About</Heading>
              <p>{data.about}</p>
            </div>
          ) : null}

          {sections.map((section) =>
            section.layout === "skills" ? (
              inSide ? null : skills(section, "main")
            ) : section.layout === "cards" && data.template === "case" ? (
              chapters(section)
            ) : section.layout === "cards" ? (
              <div key={section.id} id={anchor(section.id)} className={`tp-sec tp-cards${look(section).extra}`} style={look(section).style}>
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
              <div key={section.id} id={anchor(section.id)} className={`tp-sec tp-list${look(section).extra}`} style={look(section).style}>
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

          <ContactBlock data={data} semantic={semantic} />
        </div>
      </div>
      {showNav ? (
        <div className="tp-totop-wrap">
          <a className="tp-totop" href="#tp-top" aria-label="Back to top">
            <span aria-hidden="true">{"\u2191"}</span>
          </a>
        </div>
      ) : null}
    </div>
  );
}

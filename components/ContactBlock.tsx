import { initialsOf, linkBadge, toHref, type Portfolio } from "@/lib/portfolio";

const external = (url: string) => (/^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

// The Contact section of a portfolio, in one of three styles:
//   card   - a headline, the email and links beside the person's portrait on a card that tilts with the pointer
//   play   - the links float as bubbles that can be dragged and thrown
//   simple - the email and a row of round links
export default function ContactBlock({ data, semantic, toonId }: { data: Portfolio; semantic?: boolean; toonId?: string }) {
  const Heading = semantic ? "h2" : "div";

  // Every way to reach the person.
  const reach = [
    ...(data.email ? [{ id: "email", label: "Email", url: `mailto:${data.email}` }] : []),
    ...(data.phone.trim() ? [{ id: "phone", label: "Call", url: toHref(data.phone) }] : []),
    ...data.links
      .filter((link) => link.url.trim())
      .map((link) => ({ id: link.id, label: link.label.trim() || "Link", url: toHref(link.url) })),
  ];
  if (!reach.length) return null;

  if (data.contactStyle === "card") {
    const links = reach.filter((link) => link.id !== "email");
    return (
      <div className="tp-sec tp-contact tp-contact-card">
        <Heading className="tp-h">Contact</Heading>
        <div className={data.portrait === "none" ? "tp-ct tp-ct-solo" : "tp-ct"}>
          <div className="tp-ct-text">
            {data.contactStatus.trim() ? (
              <span className="tp-ct-status">
                <i aria-hidden="true" />
                {data.contactStatus.trim()}
              </span>
            ) : null}
            <div className="tp-ct-title">{data.contactTitle.trim() || "Let's work together."}</div>
            {data.contactNote.trim() ? <div className="tp-ct-note">{data.contactNote.trim()}</div> : null}
            {data.email ? (
              <div className="tp-ct-mail">
                <a href={`mailto:${data.email}`}>{data.email}</a>
                <button type="button" className="tp-copy" data-copy={data.email}>
                  Copy
                </button>
              </div>
            ) : null}
            {links.length ? (
              <div className="tp-ct-links">
                {links.map((link) => (
                  <a key={link.id} className="tp-ct-link" href={link.url} {...external(link.url)}>
                    <b aria-hidden="true">{linkBadge(link.label, link.url)}</b>
                    <span>{link.id === "phone" ? data.phone.trim() : link.label}</span>
                    <i aria-hidden="true" />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          {data.portrait !== "none" ? (
            // The portrait is decoration here: the name and photo are already at the top of the page.
            <div className="tp-ct-card" aria-hidden="true">
              <div className="tp-ct-back" />
              <div className={`tp-ct-photo tp-pt-${data.portrait}`}>
                {data.photo ? (
                  // The poster look is drawn by a filter that belongs to this portfolio (see PortfolioView).
                  <img src={data.photo} alt="" style={data.portrait === "poster" && toonId ? { filter: `url(#${toonId})` } : undefined} />
                ) : (
                  <span>{initialsOf(data.name || "Your Name")}</span>
                )}
              </div>
              <div className="tp-ct-tag">
                <strong>{data.name || "Your Name"}</strong>
                {data.role ? <span>{data.role}</span> : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const play = data.contactStyle === "play";
  return (
    <div className="tp-sec tp-contact">
      <Heading className="tp-h">Contact</Heading>
      {data.email ? (
        <p>
          <a href={`mailto:${data.email}`}>{data.email}</a>
        </p>
      ) : null}
      {data.phone.trim() ? (
        <a className="tp-phone" href={toHref(data.phone)}>
          {data.phone.trim()}
        </a>
      ) : null}
      <div className={play ? "tp-play" : "tp-reach"}>
        {reach.map((link) => (
          <a key={link.id} className="tp-bub" href={link.url} aria-label={link.label} {...external(link.url)}>
            <b aria-hidden="true">{linkBadge(link.label, link.url)}</b>
            <span>{link.label}</span>
          </a>
        ))}
        {play && data.buddy !== "none" ? (
          <div className={`tp-buddy tp-buddy-${data.buddy}`} aria-hidden="true">
            <span className="tp-buddy-eye">
              <i />
            </span>
            <span className="tp-buddy-eye">
              <i />
            </span>
            <span className="tp-buddy-mouth" />
          </div>
        ) : null}
      </div>
      <div className="tp-play-hint" aria-hidden="true">
        Drag a bubble, throw it, or tap it to open.{data.buddy !== "none" ? " Tap the little one to shake things up." : ""}
      </div>
    </div>
  );
}

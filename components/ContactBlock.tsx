import { initialsOf, linkBadge, toHref, type Portfolio } from "@/lib/portfolio";

const external = (url: string) => (/^https?:/.test(url) ? { target: "_blank", rel: "noopener noreferrer" } : {});

// The Contact section of a portfolio: a headline, a message form, the email and links,
// beside the person's portrait on a card that leans towards the pointer.
export default function ContactBlock({ data, semantic }: { data: Portfolio; semantic?: boolean }) {
  const Heading = semantic ? "h2" : "div";

  // Every way to reach the person besides the form.
  const links = [
    ...(data.phone.trim() ? [{ id: "phone", label: data.phone.trim(), badge: "Ph", url: toHref(data.phone) }] : []),
    ...data.links
      .filter((link) => link.url.trim())
      .map((link) => ({ id: link.id, label: link.label.trim() || "Link", badge: linkBadge(link.label, link.url), url: toHref(link.url) })),
  ];
  if (!data.email && !links.length) return null;

  const showCard = data.portrait !== "none";
  // The cut-out is used once it exists; until then the original photo stands in.
  const cut = data.portrait === "cut" && Boolean(data.photoCut);

  return (
    <div className="tp-sec tp-contact">
      <Heading className="tp-h">Contact</Heading>
      <div className={showCard ? "tp-ct" : "tp-ct tp-ct-solo"}>
        <div className="tp-ct-text">
          {data.contactStatus.trim() ? (
            <span className="tp-ct-status">
              <i aria-hidden="true" />
              {data.contactStatus.trim()}
            </span>
          ) : null}
          <div className="tp-ct-title">{data.contactTitle.trim() || "Let's work together."}</div>
          {data.contactNote.trim() ? <div className="tp-ct-note">{data.contactNote.trim()}</div> : null}

          {data.contactForm && data.email ? (
            // The portfolio script sends this: through the visitor's email app, or straight to the inbox.
            <form className="tp-form" data-to={data.email} data-send={data.contactSend}>
              <div className="tp-form-row">
                <label>
                  <span>Your name</span>
                  <input name="name" type="text" autoComplete="name" required />
                </label>
                <label>
                  <span>Your email</span>
                  <input name="email" type="email" autoComplete="email" required />
                </label>
              </div>
              <label>
                <span>Message</span>
                <textarea name="message" rows={4} required />
              </label>
              <div className="tp-form-foot">
                <button type="submit" className="tp-send">
                  Send message
                </button>
                <span className="tp-form-status" role="status" />
              </div>
            </form>
          ) : null}

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
                  <b aria-hidden="true">{link.badge}</b>
                  <span>{link.label}</span>
                  <i aria-hidden="true" />
                </a>
              ))}
            </div>
          ) : null}
        </div>

        {showCard ? (
          // The portrait is decoration here: the name and photo are already at the top of the page.
          <div className="tp-ct-card" aria-hidden="true">
            <div className="tp-ct-back" />
            <div className={cut ? "tp-ct-photo tp-pt-cut" : "tp-ct-photo"}>
              {data.photo ? <img src={cut ? data.photoCut : data.photo} alt="" /> : <span>{initialsOf(data.name || "Your Name")}</span>}
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

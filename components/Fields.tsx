"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CARD_STYLES, PORTRAITS, SENDS, FONTS, GALLERIES, LIST_STYLES, newItem, uid, type FontId, type PortraitId, type SendId, type GalleryId, type Link, type Portfolio, type Section, type SectionStyle } from "@/lib/portfolio";
import type { PortfolioTools } from "@/lib/usePortfolio";

// The form pieces shared by the details form (/start) and the editor.

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ed-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// A comma-separated list. It keeps what was typed, so commas and spaces are not eaten mid-word.
export function ListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [text, setText] = useState(value.join(", "));
  return (
    <input
      className="ed-input"
      value={text}
      placeholder={placeholder}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(",").map((t) => t.trim()).filter(Boolean));
      }}
    />
  );
}

export function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; name: string }[]; onChange: (v: T) => void }) {
  return (
    <Field label={label}>
      <select className="ed-input" value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
    </Field>
  );
}

// A colour that can also be left unset, so the page's own colour applies.
export function ColourField({ label, value, fallback, onChange }: { label: string; value: string; fallback: string; onChange: (v: string) => void }) {
  return (
    <div className="ed-field ed-colour">
      <span>{label}</span>
      <div className="ed-colour-in">
        <input type="color" className="ed-color" value={value || fallback} aria-label={label} onChange={(e) => onChange(e.target.value)} />
        {value ? (
          <button type="button" className="ed-link" onClick={() => onChange("")}>
            Reset
          </button>
        ) : (
          <em>Not set</em>
        )}
      </div>
    </div>
  );
}

// Background, text colour, accent and font for one section.
export function SectionLook({ section, setSection }: { section: Section; setSection: (id: string, patch: Partial<Section>) => void }) {
  return (
    <details className="ed-sub">
      <summary>Colours and font for this section</summary>
      <div className="ed-sub-in">
        <div className="ed-row">
          <ColourField label="Background" value={section.bg ?? ""} fallback="#ffffff" onChange={(bg) => setSection(section.id, { bg })} />
          <ColourField label="Text" value={section.ink ?? ""} fallback="#12141a" onChange={(ink) => setSection(section.id, { ink })} />
          <ColourField label="Accent" value={section.accent ?? ""} fallback="#f5a300" onChange={(accent) => setSection(section.id, { accent })} />
        </div>
        <Choice<FontId | "">
          label="Font"
          value={section.font ?? ""}
          options={[{ id: "", name: "Same as the page" }, ...FONTS]}
          onChange={(font) => setSection(section.id, { font })}
        />
      </div>
    </details>
  );
}

// A list of named links: add, edit, remove.
export function LinkList({ label, links, onChange, namePlaceholder }: { label: string; links: Link[]; onChange: (links: Link[]) => void; namePlaceholder: string }) {
  const patch = (id: string, change: Partial<Link>) => onChange(links.map((l) => (l.id === id ? { ...l, ...change } : l)));
  return (
    <div className="ed-field">
      <span>{label}</span>
      {links.map((link) => (
        <div key={link.id} className="ed-row">
          <input className="ed-input" placeholder={namePlaceholder} aria-label="Link name" value={link.label} onChange={(e) => patch(link.id, { label: e.target.value })} />
          <input className="ed-input" placeholder="https://" aria-label="Link address" value={link.url} onChange={(e) => patch(link.id, { url: e.target.value })} />
          <button type="button" className="ed-icon" aria-label={`Remove link ${link.label}`} onClick={() => onChange(links.filter((l) => l.id !== link.id))}>
            ×
          </button>
        </div>
      ))}
      <button type="button" className="ed-link" onClick={() => onChange([...links, { id: uid(), label: "", url: "" }])}>
        + Add a link
      </button>
    </div>
  );
}

// The end of the page: the quote, and what the Contact section says and shows.
export function ClosingFields({ data, set }: { data: Portfolio; set: (patch: Partial<Portfolio>) => void }) {
  const [note, setNote] = useState("");

  // Make the cut-out the first time "Background removed" is chosen, and again whenever the photo changes.
  useEffect(() => {
    if (data.portrait !== "cut" || !data.photo || data.photoCut) return;
    let stale = false;
    setNote("Removing the background. This can take a few seconds the first time.");
    import("@/lib/cutout")
      .then(({ removeBackground }) => removeBackground(data.photo))
      .then((photoCut) => {
        if (stale) return;
        set({ photoCut });
        setNote("");
      })
      .catch(() => {
        if (stale) return;
        set({ portrait: "plain" });
        setNote("Could not find a person to cut out in this photo, so the original is shown.");
      });
    return () => {
      stale = true;
    };
    // "set" is recreated on every render and must not restart the work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.portrait, data.photo, data.photoCut]);

  return (
    <>
      <Field label="Quote (shown above Contact)">
        <textarea className="ed-input" rows={2} value={data.quote} placeholder="A line you live or work by." onChange={(e) => set({ quote: e.target.value })} />
      </Field>
      <Field label="Who said it">
        <input className="ed-input" value={data.quoteBy} placeholder="Leave empty if it is yours" onChange={(e) => set({ quoteBy: e.target.value })} />
      </Field>
      <Field label="Contact headline">
        <input className="ed-input" value={data.contactTitle} placeholder="Let's work together." onChange={(e) => set({ contactTitle: e.target.value })} />
      </Field>
      <Field label="A line under it (optional)">
        <textarea className="ed-input" rows={2} value={data.contactNote} placeholder="What you are looking for, and how fast you reply." onChange={(e) => set({ contactNote: e.target.value })} />
      </Field>
      <Field label="Status badge (optional)">
        <input className="ed-input" value={data.contactStatus} placeholder="Open to internships" onChange={(e) => set({ contactStatus: e.target.value })} />
      </Field>

      <Choice<PortraitId> label="Your photo on the contact card" value={data.portrait} options={PORTRAITS} onChange={(portrait) => set({ portrait })} />
      {data.portrait === "cut" && !data.photo ? <p className="ed-hint">Add your photo in About you first.</p> : null}
      {note ? (
        <p className="ed-hint" role="status">
          {note}
        </p>
      ) : null}

      <label className="ed-check">
        <input type="checkbox" checked={data.contactForm} onChange={(e) => set({ contactForm: e.target.checked })} />
        Let visitors write you a message
      </label>
      {data.contactForm ? (
        <>
          <Choice<SendId> label="How messages reach you" value={data.contactSend} options={SENDS} onChange={(contactSend) => set({ contactSend })} />
          <p className="ed-hint">
            {data.contactSend === "direct"
              ? "Messages go through FormSubmit, a free outside service, to the email in About you. The first message makes it send you a confirmation email; after you confirm, messages arrive in your inbox. If it fails, the visitor's email app opens instead."
              : "The visitor's email app opens with their message filled in, addressed to the email in About you. Nothing passes through any other service."}
          </p>
        </>
      ) : null}
      <p className="ed-hint">Contact also shows your email, phone and every link from About you.</p>
    </>
  );
}

export function move<T>(list: T[], index: number, by: number) {
  const to = index + by;
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [taken] = next.splice(index, 1);
  next.splice(to, 0, taken);
  return next;
}

type Tools = Pick<PortfolioTools, "set" | "setSection" | "setItem" | "addPhotos" | "setAvatar">;

// "Tap the part of your photo that should stay in view." Frames that crop the photo keep that point visible.
// Arrow keys move the point too.
function PhotoFocus({ photo, focus, onChange }: { photo: string; focus: string; onChange: (focus: string) => void }) {
  const [x, y] = (focus || "50% 30%").split(" ").map((v) => parseFloat(v));
  const place = (nx: number, ny: number) => onChange(`${Math.round(Math.max(0, Math.min(100, nx)))}% ${Math.round(Math.max(0, Math.min(100, ny)))}%`);
  return (
    <div className="ed-field">
      <span>Tap the part of your photo that should always stay in view (usually your face)</span>
      <div className="ed-focus-row">
        <button
          type="button"
          className="ed-focus"
          aria-label={`Point to keep in view: ${Math.round(x)}% across, ${Math.round(y)}% down. Click the photo or use the arrow keys to move it.`}
          onClick={(e) => {
            const box = e.currentTarget.querySelector("img")!.getBoundingClientRect();
            place(((e.clientX - box.left) / box.width) * 100, ((e.clientY - box.top) / box.height) * 100);
          }}
          onKeyDown={(e) => {
            const step = e.shiftKey ? 10 : 4;
            const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
            const m = moves[e.key];
            if (!m) return;
            e.preventDefault();
            place(x + m[0], y + m[1]);
          }}
        >
          <span className="ed-focus-img">
            <img src={photo} alt="" />
            <i style={{ left: `${x}%`, top: `${y}%` }} aria-hidden="true" />
          </span>
        </button>
        <div className="ed-focus-previews" aria-hidden="true">
          <span className="is-round">
            <img src={photo} alt="" style={{ objectPosition: `${x}% ${y}%` }} />
          </span>
          <span className="is-tall">
            <img src={photo} alt="" style={{ objectPosition: `${x}% ${y}%` }} />
          </span>
          <span className="is-wide">
            <img src={photo} alt="" style={{ objectPosition: `${x}% ${y}%` }} />
          </span>
        </div>
      </div>
      {focus ? (
        <button type="button" className="ed-link" onClick={() => onChange("")}>
          Reset to the top middle
        </button>
      ) : null}
    </div>
  );
}

export function ProfileFields({ data, tools }: { data: Portfolio; tools: Tools }) {
  const { set, setAvatar } = tools;
  return (
    <>
      <div className="ed-field">
        <span>Your photo</span>
        <div className="ed-photos">
          {data.photo ? (
            <div className="ed-photo ed-photo-me">
              <img src={data.photo} alt="Your photo" />
              <button type="button" aria-label="Remove your photo" onClick={() => set({ photo: "", photoCut: "" })}>
                ×
              </button>
            </div>
          ) : null}
          <label className="ed-add">
            {data.photo ? "Change" : "Add photo"}
            <input type="file" accept="image/*" onChange={(e) => { setAvatar(e.target.files); e.target.value = ""; }} />
          </label>
        </div>
      </div>
      {data.photo ? <PhotoFocus photo={data.photo} focus={data.photoFocus} onChange={(photoFocus) => set({ photoFocus })} /> : null}
      <Field label="Name">
        <input className="ed-input" value={data.name} placeholder="Your full name" onChange={(e) => set({ name: e.target.value })} />
      </Field>
      <div className="ed-row">
        <Field label="What you do">
          <input className="ed-input" value={data.role} placeholder="Data Analyst" onChange={(e) => set({ role: e.target.value })} />
        </Field>
        <Field label="City">
          <input className="ed-input" value={data.city} placeholder="Bengaluru" onChange={(e) => set({ city: e.target.value })} />
        </Field>
      </div>
      <Field label="One-line intro">
        <textarea className="ed-input" rows={2} value={data.bio} placeholder="One line about you and the work you want." onChange={(e) => set({ bio: e.target.value })} />
      </Field>
      <Field label="About">
        <textarea className="ed-input" rows={4} value={data.about} placeholder="A few sentences about your background." onChange={(e) => set({ about: e.target.value })} />
      </Field>
      <Field label="Email">
        <input className="ed-input" type="email" value={data.email} placeholder="you@example.com" onChange={(e) => set({ email: e.target.value })} />
      </Field>
      <Field label="Phone (optional)">
        <input className="ed-input" type="tel" value={data.phone} placeholder="+91 98765 43210" onChange={(e) => set({ phone: e.target.value })} />
      </Field>
      <LinkList label="Social and other links" links={data.links} namePlaceholder="LinkedIn" onChange={(links) => set({ links })} />
    </>
  );
}

// One section: its title, its look, and its entries with their photos.
// "design" adds the layout and style controls, which the details form leaves out.
export function SectionFields({ data, section, tools, design }: { data: Portfolio; section: Section; tools: Tools; design: boolean }) {
  const { set, setSection, setItem, addPhotos } = tools;
  const styles = section.layout === "cards" ? CARD_STYLES : LIST_STYLES;

  // The skills section has no entries, only the list of skills.
  if (section.layout === "skills") {
    return (
      <>
        <Field label="Section title">
          <input className="ed-input" value={section.title} onChange={(e) => setSection(section.id, { title: e.target.value })} />
        </Field>
        <Field label="Skills, separated by commas">
          <ListInput value={data.skills} onChange={(skills) => set({ skills })} placeholder="Excel, Python, Public speaking" />
        </Field>
        {design ? (
          <>
            <SectionLook section={section} setSection={setSection} />
            <div className="ed-tools">
              <button type="button" className="ed-link" onClick={() => setSection(section.id, { hidden: !section.hidden })}>
                {section.hidden ? "Show" : "Hide"}
              </button>
            </div>
          </>
        ) : null}
      </>
    );
  }

  return (
    <>
      <Field label="Section title">
        <input className="ed-input" value={section.title} onChange={(e) => setSection(section.id, { title: e.target.value })} />
      </Field>

      {design ? (
        <>
          <div className="ed-row">
            <div className="ed-field">
              <span>Layout</span>
              <div className="ed-seg" role="group" aria-label="Layout">
                <button type="button" aria-pressed={section.layout === "cards"} onClick={() => setSection(section.id, { layout: "cards", style: "" })}>
                  Cards
                </button>
                <button type="button" aria-pressed={section.layout === "list"} onClick={() => setSection(section.id, { layout: "list", style: "" })}>
                  List
                </button>
              </div>
            </div>
            <Choice<SectionStyle> label="Style" value={section.style} options={styles} onChange={(style) => setSection(section.id, { style })} />
          </div>
          <SectionLook section={section} setSection={setSection} />
          <div className="ed-tools">
            <button type="button" className="ed-link" onClick={() => setSection(section.id, { hidden: !section.hidden })}>
              {section.hidden ? "Show" : "Hide"}
            </button>
            <button
              type="button"
              className="ed-link ed-danger"
              onClick={() => {
                if (window.confirm(`Delete the section "${section.title}" and everything in it?`)) {
                  set({ sections: data.sections.filter((s) => s.id !== section.id) });
                }
              }}
            >
              Delete
            </button>
          </div>
        </>
      ) : null}

      {section.items.map((item, itemIndex) => (
        <div key={item.id} className="ed-item">
          <div className="ed-item-head">
            <strong>{item.title || "New entry"}</strong>
            <button type="button" className="ed-icon" aria-label="Move entry up" disabled={itemIndex === 0} onClick={() => setSection(section.id, { items: move(section.items, itemIndex, -1) })}>
              ↑
            </button>
            <button type="button" className="ed-icon" aria-label="Move entry down" disabled={itemIndex === section.items.length - 1} onClick={() => setSection(section.id, { items: move(section.items, itemIndex, 1) })}>
              ↓
            </button>
            <button type="button" className="ed-icon" aria-label={`Delete ${item.title || "entry"}`} onClick={() => setSection(section.id, { items: section.items.filter((it) => it.id !== item.id) })}>
              ×
            </button>
          </div>
          <Field label="Title">
            <input className="ed-input" value={item.title} onChange={(e) => setItem(section.id, item.id, { title: e.target.value })} />
          </Field>
          <div className="ed-row">
            <Field label="Place or company">
              <input className="ed-input" value={item.sub} onChange={(e) => setItem(section.id, item.id, { sub: e.target.value })} />
            </Field>
            <Field label="Dates">
              <input className="ed-input" value={item.meta} onChange={(e) => setItem(section.id, item.id, { meta: e.target.value })} />
            </Field>
          </div>
          <Field label="Short description (shown on the page)">
            <textarea className="ed-input" rows={2} value={item.text} onChange={(e) => setItem(section.id, item.id, { text: e.target.value })} />
          </Field>
          <Field label="Full details (shown when a visitor taps See details)">
            <textarea
              className="ed-input"
              rows={4}
              value={item.details ?? ""}
              placeholder="What the work was, what you did, and what came of it."
              onChange={(e) => setItem(section.id, item.id, { details: e.target.value })}
            />
          </Field>
          <Field label="Result (optional, one line)">
            <input
              className="ed-input"
              value={item.result ?? ""}
              placeholder="What changed because of it, e.g. Cut refund failures by a third"
              onChange={(e) => setItem(section.id, item.id, { result: e.target.value })}
            />
          </Field>
          <Field label="Tags, separated by commas">
            <ListInput value={item.tags} onChange={(tags) => setItem(section.id, item.id, { tags })} />
          </Field>
          <LinkList
            label="Links for this entry"
            links={item.links ?? []}
            namePlaceholder="Live project"
            onChange={(links) => setItem(section.id, item.id, { links })}
          />
          <div className="ed-field">
            <span>Photos (shown with the full details)</span>
            <div className="ed-photos">
              {item.photos.map((photo, photoIndex) => (
                <div key={photoIndex} className="ed-photo">
                  <img src={photo} alt={`Photo ${photoIndex + 1} of ${item.title}`} />
                  <button
                    type="button"
                    aria-label={`Remove photo ${photoIndex + 1} of ${item.title}`}
                    onClick={() => setItem(section.id, item.id, { photos: item.photos.filter((_, i) => i !== photoIndex) })}
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="ed-add">
                Add photos
                <input type="file" accept="image/*" multiple onChange={(e) => { addPhotos(section.id, item, e.target.files); e.target.value = ""; }} />
              </label>
            </div>
          </div>
          {item.photos.length ? (
            <Choice<GalleryId | "">
              label="How these photos open"
              value={item.gallery ?? ""}
              options={[{ id: "", name: "Same as the rest of the site" }, ...GALLERIES]}
              onChange={(gallery) => setItem(section.id, item.id, { gallery })}
            />
          ) : null}
        </div>
      ))}
      <button type="button" className="btn btn-quiet" onClick={() => setSection(section.id, { items: [...section.items, newItem()] })}>
        + Add an entry
      </button>
    </>
  );
}

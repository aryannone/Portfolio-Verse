"use client";

import { useState, type ReactNode } from "react";
import { CARD_STYLES, GALLERIES, LIST_STYLES, newItem, uid, type GalleryId, type Portfolio, type Section, type SectionStyle } from "@/lib/portfolio";
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

export function move<T>(list: T[], index: number, by: number) {
  const to = index + by;
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [taken] = next.splice(index, 1);
  next.splice(to, 0, taken);
  return next;
}

type Tools = Pick<PortfolioTools, "set" | "setSection" | "setItem" | "addPhotos" | "setAvatar">;

export function ProfileFields({ data, tools }: { data: Portfolio; tools: Tools }) {
  const { set, setAvatar } = tools;
  const setLink = (id: string, patch: { label?: string; url?: string }) =>
    set({ links: data.links.map((l) => (l.id === id ? { ...l, ...patch } : l)) });

  return (
    <>
      <div className="ed-field">
        <span>Your photo</span>
        <div className="ed-photos">
          {data.photo ? (
            <div className="ed-photo ed-photo-me">
              <img src={data.photo} alt="Your photo" />
              <button type="button" aria-label="Remove your photo" onClick={() => set({ photo: "" })}>
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
      <div className="ed-field">
        <span>Links</span>
        {data.links.map((link) => (
          <div key={link.id} className="ed-row">
            <input className="ed-input" placeholder="LinkedIn" aria-label="Link name" value={link.label} onChange={(e) => setLink(link.id, { label: e.target.value })} />
            <input className="ed-input" placeholder="https://" aria-label="Link address" value={link.url} onChange={(e) => setLink(link.id, { url: e.target.value })} />
            <button type="button" className="ed-icon" aria-label={`Remove link ${link.label}`} onClick={() => set({ links: data.links.filter((l) => l.id !== link.id) })}>
              ×
            </button>
          </div>
        ))}
        <button type="button" className="ed-link" onClick={() => set({ links: [...data.links, { id: uid(), label: "", url: "" }] })}>
          + Add a link
        </button>
      </div>
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
          <div className="ed-tools">
            <button type="button" className="ed-link" onClick={() => setSection(section.id, { hidden: !section.hidden })}>
              {section.hidden ? "Show" : "Hide"}
            </button>
          </div>
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
          <Field label="Description">
            <textarea className="ed-input" rows={2} value={item.text} onChange={(e) => setItem(section.id, item.id, { text: e.target.value })} />
          </Field>
          <Field label="Tags, separated by commas">
            <ListInput value={item.tags} onChange={(tags) => setItem(section.id, item.id, { tags })} />
          </Field>
          <div className="ed-field">
            <span>Photos (visitors tap this entry to see them)</span>
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

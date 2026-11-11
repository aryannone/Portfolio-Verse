"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import PortfolioView from "@/components/PortfolioView";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import {
  ACCENTS,
  FONTS,
  blankPortfolio,
  fromSample,
  newItem,
  newSection,
  uid,
  type Item,
  type Portfolio,
  type Section,
} from "@/lib/portfolio";
import { imageToDataUrl, loadPortfolio, savePortfolio } from "@/lib/store";
import { buildHtml, downloadHtml } from "@/lib/exportHtml";

const PHOTO_SIDE = 1600;
const AVATAR_SIDE = 480;
const MAX_PHOTOS_PER_ITEM = 12;

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="ed-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

// A comma-separated list. It keeps what was typed, so commas and spaces are not eaten mid-word.
function ListInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
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

function move<T>(list: T[], index: number, by: number) {
  const to = index + by;
  if (to < 0 || to >= list.length) return list;
  const next = list.slice();
  const [taken] = next.splice(index, 1);
  next.splice(to, 0, taken);
  return next;
}

export default function Editor() {
  const [data, setData] = useState<Portfolio | null>(null);
  const [preview, setPreview] = useState(false);
  const [phone, setPhone] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const viewRef = useRef<HTMLDivElement | null>(null);
  const loaded = useRef(false);

  // Load the saved portfolio, or start from the sample person of the chosen template.
  useEffect(() => {
    let chosen = "";
    try {
      chosen = window.localStorage.getItem("pv_template") || "";
      window.localStorage.removeItem("pv_template");
    } catch {
      // Storage can be blocked; the template can still be changed in the editor.
    }
    const template = getTemplate(chosen)?.id;
    loadPortfolio().then((saved) => {
      loaded.current = true;
      if (saved && Array.isArray(saved.sections)) {
        // A saved sample has nothing of the user's in it, so a newly chosen template shows its own sample.
        if (template && saved.sample) setData(fromSample(template));
        else setData(template ? { ...saved, template } : saved);
      } else {
        setData(fromSample(template || TEMPLATES[0].id));
      }
    });
  }, []);

  // Save a moment after the last change.
  useEffect(() => {
    if (!data || !loaded.current) return;
    const timer = window.setTimeout(async () => {
      const ok = await savePortfolio(data);
      setStatus(ok ? "Saved in this browser" : "Could not save in this browser");
    }, 500);
    return () => window.clearTimeout(timer);
  }, [data]);

  if (!data) {
    return (
      <div className="ed-loading" role="status">
        Opening the editor…
      </div>
    );
  }

  const set = (patch: Partial<Portfolio>) => setData((d) => (d ? { ...d, ...patch, sample: false } : d));

  const setSection = (id: string, patch: Partial<Section>) =>
    setData((d) => (d ? { ...d, sample: false, sections: d.sections.map((s) => (s.id === id ? { ...s, ...patch } : s)) } : d));

  const setItem = (sectionId: string, itemId: string, patch: Partial<Item>) =>
    setData((d) =>
      d
        ? {
            ...d,
            sample: false,
            sections: d.sections.map((s) =>
              s.id === sectionId ? { ...s, items: s.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) } : s,
            ),
          }
        : d,
    );

  async function addPhotos(sectionId: string, item: Item, files: FileList | null) {
    if (!files || !files.length) return;
    const room = MAX_PHOTOS_PER_ITEM - item.photos.length;
    const chosen = Array.from(files).slice(0, Math.max(0, room));
    const added: string[] = [];
    for (const file of chosen) {
      try {
        added.push(await imageToDataUrl(file, PHOTO_SIDE));
      } catch {
        setStatus(`Could not read ${file.name}`);
      }
    }
    if (files.length > chosen.length) setStatus(`Up to ${MAX_PHOTOS_PER_ITEM} photos per entry`);
    if (!added.length) return;
    // Read the latest photos at update time, in case another upload finished meanwhile.
    setData((d) =>
      d
        ? {
            ...d,
            sample: false,
            sections: d.sections.map((s) =>
              s.id === sectionId
                ? { ...s, items: s.items.map((it) => (it.id === item.id ? { ...it, photos: [...it.photos, ...added] } : it)) }
                : s,
            ),
          }
        : d,
    );
  }

  async function setAvatar(files: FileList | null) {
    if (!files || !files[0]) return;
    try {
      set({ photo: await imageToDataUrl(files[0], AVATAR_SIDE) });
    } catch {
      setStatus("Could not read that picture");
    }
  }

  async function download() {
    if (!viewRef.current || !data) return;
    setBusy(true);
    try {
      downloadHtml(await buildHtml(viewRef.current, data), data.name);
      setStatus("Downloaded your portfolio file");
    } catch {
      setStatus("Could not build the file. Please try again.");
    }
    setBusy(false);
  }

  function startOver(next: Portfolio) {
    if (!window.confirm("This replaces everything in the editor. Continue?")) return;
    setData(next);
    setResetKey((k) => k + 1);
  }

  const template = getTemplate(data.template) ?? TEMPLATES[0];
  const accent = data.accent || template.accent;

  return (
    <div className={preview ? "ed is-preview" : "ed"}>
      <header className="ed-bar">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="ed-brand-text">PORTFOLIO-VERSE</span>
        </Link>
        <span className="ed-status" role="status">
          {status}
        </span>
        <div className="ed-actions">
          <div className="ed-seg ed-device" role="group" aria-label="Preview size">
            <button type="button" aria-pressed={!phone} onClick={() => setPhone(false)}>
              Desktop
            </button>
            <button type="button" aria-pressed={phone} onClick={() => setPhone(true)}>
              Phone
            </button>
          </div>
          <button type="button" className="btn btn-outline" onClick={() => setPreview((v) => !v)}>
            {preview ? "Back to editing" : "Preview"}
          </button>
          <button type="button" className="btn btn-primary" onClick={download} disabled={busy}>
            {busy ? "Building…" : "Download HTML"}
          </button>
        </div>
      </header>

      <div className="ed-body">
        <aside className="ed-panel" key={resetKey} aria-label="Edit your portfolio">
          {data.sample ? (
            <div className="notice">
              This is sample content, so you can see how everything looks. Type over it, or{" "}
              <button type="button" className="ed-link" onClick={() => startOver(blankPortfolio(data.template))}>
                start blank
              </button>
              .
            </div>
          ) : null}

          <details className="ed-group" open>
            <summary>Design</summary>
            <div className="ed-group-in">
              <div className="ed-field">
                <span>Template</span>
                <div className="ed-templates">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={t.id === data.template ? "ed-template is-on" : "ed-template"}
                      aria-pressed={t.id === data.template}
                      onClick={() => set({ template: t.id })}
                    >
                      <i style={{ background: t.accent }} aria-hidden="true" />
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ed-field">
                <span>Colour</span>
                <div className="ed-swatches">
                  {ACCENTS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={accent === c ? "ed-swatch is-on" : "ed-swatch"}
                      style={{ background: c }}
                      aria-label={`Colour ${c}`}
                      aria-pressed={accent === c}
                      onClick={() => set({ accent: c })}
                    />
                  ))}
                  <input
                    type="color"
                    className="ed-color"
                    value={accent}
                    aria-label="Pick any colour"
                    onChange={(e) => set({ accent: e.target.value })}
                  />
                  {data.accent ? (
                    <button type="button" className="ed-link" onClick={() => set({ accent: "" })}>
                      Use template colour
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="ed-field">
                <span>Heading font</span>
                <div className="ed-seg" role="group" aria-label="Heading font">
                  {FONTS.map((f) => (
                    <button key={f.id} type="button" aria-pressed={data.font === f.id} onClick={() => set({ font: f.id })}>
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </details>

          <details className="ed-group" open>
            <summary>About you</summary>
            <div className="ed-group-in">
              <div className="ed-field">
                <span>Your photo</span>
                <div className="ed-photos">
                  {data.photo ? (
                    <div className="ed-photo">
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
                <input className="ed-input" value={data.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="What you do">
                <input className="ed-input" value={data.role} onChange={(e) => set({ role: e.target.value })} />
              </Field>
              <Field label="City">
                <input className="ed-input" value={data.city} onChange={(e) => set({ city: e.target.value })} />
              </Field>
              <Field label="One-line intro">
                <textarea className="ed-input" rows={2} value={data.bio} onChange={(e) => set({ bio: e.target.value })} />
              </Field>
              <Field label="About">
                <textarea className="ed-input" rows={4} value={data.about} onChange={(e) => set({ about: e.target.value })} />
              </Field>
              <Field label="Email">
                <input className="ed-input" type="email" value={data.email} onChange={(e) => set({ email: e.target.value })} />
              </Field>
              <Field label="Skills, separated by commas">
                <ListInput value={data.skills} onChange={(skills) => set({ skills })} placeholder="Excel, Python, Public speaking" />
              </Field>
              <div className="ed-field">
                <span>Links</span>
                {data.links.map((link) => (
                  <div key={link.id} className="ed-row">
                    <input
                      className="ed-input"
                      placeholder="LinkedIn"
                      aria-label="Link name"
                      value={link.label}
                      onChange={(e) => set({ links: data.links.map((l) => (l.id === link.id ? { ...l, label: e.target.value } : l)) })}
                    />
                    <input
                      className="ed-input"
                      placeholder="https://"
                      aria-label="Link address"
                      value={link.url}
                      onChange={(e) => set({ links: data.links.map((l) => (l.id === link.id ? { ...l, url: e.target.value } : l)) })}
                    />
                    <button type="button" className="ed-icon" aria-label={`Remove link ${link.label}`} onClick={() => set({ links: data.links.filter((l) => l.id !== link.id) })}>
                      ×
                    </button>
                  </div>
                ))}
                <button type="button" className="ed-link" onClick={() => set({ links: [...data.links, { id: uid(), label: "", url: "" }] })}>
                  + Add a link
                </button>
              </div>
            </div>
          </details>

          {data.sections.map((section, sectionIndex) => (
            <details key={section.id} className="ed-group" open>
              <summary>
                {section.title || "Untitled section"}
                {section.hidden ? <em> (hidden)</em> : null}
              </summary>
              <div className="ed-group-in">
                <Field label="Section title">
                  <input className="ed-input" value={section.title} onChange={(e) => setSection(section.id, { title: e.target.value })} />
                </Field>
                <div className="ed-tools">
                  <div className="ed-seg" role="group" aria-label="Layout">
                    <button type="button" aria-pressed={section.layout === "cards"} onClick={() => setSection(section.id, { layout: "cards" })}>
                      Cards
                    </button>
                    <button type="button" aria-pressed={section.layout === "list"} onClick={() => setSection(section.id, { layout: "list" })}>
                      List
                    </button>
                  </div>
                  <button type="button" className="ed-icon" aria-label="Move section up" disabled={sectionIndex === 0} onClick={() => set({ sections: move(data.sections, sectionIndex, -1) })}>
                    ↑
                  </button>
                  <button type="button" className="ed-icon" aria-label="Move section down" disabled={sectionIndex === data.sections.length - 1} onClick={() => set({ sections: move(data.sections, sectionIndex, 1) })}>
                    ↓
                  </button>
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
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => { addPhotos(section.id, item, e.target.files); e.target.value = ""; }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" className="btn btn-quiet" onClick={() => setSection(section.id, { items: [...section.items, newItem()] })}>
                  + Add an entry
                </button>
              </div>
            </details>
          ))}

          <div className="ed-foot">
            <button type="button" className="btn btn-outline" onClick={() => set({ sections: [...data.sections, newSection("New section", "list")] })}>
              + Add a section
            </button>
            <button type="button" className="ed-link" onClick={() => startOver(blankPortfolio(data.template))}>
              Start blank
            </button>
            <button type="button" className="ed-link" onClick={() => startOver(fromSample(data.template))}>
              Load sample content
            </button>
          </div>
        </aside>

        <div className="ed-stage">
          <div className={phone && !preview ? "ed-frame is-phone" : "ed-frame"}>
            <PortfolioView
              key={`${preview}-${data.template}`}
              data={data}
              interactive
              semantic
              reveal={preview}
              animate={preview}
              rootRef={viewRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

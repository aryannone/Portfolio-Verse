"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import PortfolioView from "@/components/PortfolioView";
import { Choice, ClosingFields, ProfileFields, SectionFields, move } from "@/components/Fields";
import ResumeImport from "@/components/ResumeImport";
import HelperBot from "@/components/HelperBot";
import { TEMPLATES, getTemplate } from "@/lib/templates";
import {
  ACCENTS,
  FONTS,
  FRAMES,
  RESUMES,
  GALLERIES,
  HEROES,
  MOTIONS,
  THEMES,
  blankPortfolio,
  fromSample,
  newSection,
  type FontId,
  type FrameId,
  type GalleryId,
  type HeroId,
  type MotionId,
  type ResumeId,
  type Portfolio,
  type ThemeId,
} from "@/lib/portfolio";
import { usePortfolio } from "@/lib/usePortfolio";
import { buildHtml, downloadHtml } from "@/lib/exportHtml";
import { addSaved, loadSaved, savePortfolio } from "@/lib/store";
import { rememberDetails } from "@/lib/usePortfolio";
import { useRouter } from "next/navigation";

const PHOTO_SIZES: { id: Portfolio["photoSize"]; name: string }[] = [
  { id: "s", name: "Small" },
  { id: "m", name: "Medium" },
  { id: "l", name: "Large" },
];

// What the editor opens with: the saved portfolio, moved to a newly picked template if there is one.
function start(saved: Portfolio | null, template: string | undefined) {
  if (!saved) return fromSample(template || TEMPLATES[0].id);
  // A saved sample has nothing of the user's in it, so a newly picked template shows its own sample.
  if (template && saved.sample) return fromSample(template);
  return template ? { ...saved, template } : saved;
}

export default function Editor() {
  const tools = usePortfolio(start, { forgetTemplate: true });
  const { data, set, replaceWith, status, setStatus } = tools;
  const [preview, setPreview] = useState(false);
  const [phone, setPhone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [importNote, setImportNote] = useState("");
  // A short notice at the bottom of the screen, shown on every screen size (the status line is hidden on phones).
  const [toast, setToast] = useState<"" | "resume" | "failed">("");
  const toastTimer = useRef(0);
  // It closes by itself after a while, but not while the pointer is over it (Macmey can be played with).
  const showToast = (kind: "resume" | "failed") => {
    setToast(kind);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 14000);
  };
  const viewRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  if (!data) {
    return (
      <div className="ed-loading" role="status">
        Opening the editor…
      </div>
    );
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

  // Keeps a separate copy of the portfolio as it is now, under a name. The portfolio itself is saved as you type.
  async function saveCopy() {
    if (!data) return;
    const suggested = `${data.name || "My portfolio"}, ${(getTemplate(data.template) ?? TEMPLATES[0]).name}`;
    const name = window.prompt("Name this copy:", `${suggested} (copy)`);
    if (name === null) return;
    const ok = await addSaved(name.trim() || suggested, data);
    setStatus(ok ? "Copy saved to My portfolios" : "Could not save. This browser may be out of space.");
  }

  // A résumé PDF made from the details as they are now.
  async function downloadResume() {
    if (!data) return;
    setStatus("Making your résumé…");
    try {
      const { makeResume, resumeFileName, saveBlob } = await import("@/lib/resumePdf");
      saveBlob(await makeResume(data, { photo: data.resumePhoto }), resumeFileName(data));
      setStatus("Downloaded your résumé PDF. Please read it through before sending it.");
      showToast("resume");
    } catch {
      setStatus("Could not make the résumé. Please try again.");
      showToast("failed");
    }
  }

  // Shows these details in every template, to save them in another look as a separate portfolio.
  async function otherTemplates() {
    if (!data) return;
    await savePortfolio(data);
    rememberDetails((await loadSaved()).current);
    router.push("/templates");
  }

  // Starts another portfolio. The one open now stays in My portfolios, so nothing is lost.
  async function startAnother(next: Portfolio) {
    await replaceWith(next);
    setResetKey((k) => k + 1);
    setStatus("Started a new portfolio. Your earlier one is in My portfolios.");
  }

  const template = getTemplate(data.template) ?? TEMPLATES[0];
  const accent = data.accent || template.accent;

  return (
    <div className={preview ? "ed is-preview" : "ed"}>
      {toast ? (
        <div
          className="ed-toast"
          onPointerEnter={() => window.clearTimeout(toastTimer.current)}
          onPointerLeave={() => {
            toastTimer.current = window.setTimeout(() => setToast(""), 6000);
          }}
        >
          <HelperBot
            small
            mood={toast === "failed" ? "error" : "done"}
            lines={
              toast === "failed"
                ? ["Oops, I dropped the pages. Please try downloading again."]
                : [
                    "Here's your résumé! I built it only from what you typed, so I can't catch mistakes in it.",
                    "I don't spell-check, sorry. A quick read now saves an awkward email later.",
                    "Tip: open the PDF once and tap every link to be sure it goes where it should.",
                  ]
            }
          />
          <div className="ed-toast-text">
            {toast === "failed" ? (
              <p>Could not make the résumé. Please try again.</p>
            ) : (
              <p className="rs-disclaimer">
                <strong>Résumé downloaded. Check before you send it.</strong> It is made only from the details you entered
                here, by a free tool without AI, so it is as accurate as they are. Read through names, dates and links
                before sharing it.
              </p>
            )}
          </div>
          <button type="button" className="ed-toast-close" aria-label="Close this notice" onClick={() => setToast("")}>
            ×
          </button>
        </div>
      ) : null}
      <header className="ed-bar">
        <Link href="/" className="brand" aria-label="Portfolio-Verse home">
          <LogoMark size={36} />
          <span className="brand-text ed-brand-text">
            PORTFOLIO<span className="brand-verse">VERSE</span>
          </span>
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
          <button type="button" className="btn btn-outline" onClick={saveCopy}>
            Save a copy
          </button>
          <Link href="/saved" className="btn btn-quiet">
            My portfolios
          </Link>
          <button type="button" className="btn btn-outline" onClick={downloadResume}>
            Résumé PDF
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
              <Link href="/start" className="ed-link">
                fill in your details step by step
              </Link>
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
                  <input type="color" className="ed-color" value={accent} aria-label="Pick any colour" onChange={(e) => set({ accent: e.target.value })} />
                  {data.accent ? (
                    <button type="button" className="ed-link" onClick={() => set({ accent: "" })}>
                      Use template colour
                    </button>
                  ) : null}
                </div>
              </div>
              <div className="ed-row">
                <Choice<ThemeId> label="Page background" value={data.theme} options={THEMES} onChange={(theme) => set({ theme })} />
                <Choice<HeroId> label="Header layout" value={data.hero} options={HEROES} onChange={(hero) => set({ hero })} />
              </div>
              <Choice<FrameId> label="Photo frame" value={data.frame} options={FRAMES} onChange={(frame) => set({ frame })} />
              <div className="ed-row">
                <div className="ed-field">
                  <span>Photo size</span>
                  <div className="ed-seg" role="group" aria-label="Photo size">
                    {PHOTO_SIZES.map((size) => (
                      <button key={size.id} type="button" aria-pressed={data.photoSize === size.id} onClick={() => set({ photoSize: size.id })}>
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="ed-row">
                <Choice<FontId> label="Heading font" value={data.font} options={FONTS} onChange={(font) => set({ font })} />
                <Choice<FontId> label="Text font" value={data.bodyFont} options={FONTS} onChange={(bodyFont) => set({ bodyFont })} />
              </div>
              <Choice<MotionId> label="Scroll animation" value={data.motion} options={MOTIONS} onChange={(motion) => set({ motion })} />
              <Choice<GalleryId> label="Photo layout in the details panel" value={data.gallery} options={GALLERIES} onChange={(gallery) => set({ gallery })} />
              <label className="ed-check">
                <input type="checkbox" checked={data.bigName} onChange={(e) => set({ bigName: e.target.checked })} />
                Extra-large name
              </label>
              <label className="ed-check">
                <input type="checkbox" checked={data.glow} onChange={(e) => set({ glow: e.target.checked })} />
                Glowing background
              </label>
              <label className="ed-check">
                <input type="checkbox" checked={data.progress} onChange={(e) => set({ progress: e.target.checked })} />
                Reading progress bar at the top
              </label>
              <p className="ed-hint">Animations play in Preview and in the downloaded file.</p>
              {data.template === "professional-2" ? (
                <p className="ed-hint">In this template, Skills stay in the side panel wherever the Skills section is moved.</p>
              ) : null}
            </div>
          </details>

          <details className="ed-group" open>
            <summary>Résumé</summary>
            <div className="ed-group-in">
              <ResumeImport
                data={data}
                set={set}
                replaceWith={replaceWith}
                compact
                onDone={(message) => {
                  setImportNote(message);
                  setResetKey((k) => k + 1);
                }}
              />
              {importNote ? (
                <p className="ed-hint" role="status">
                  {importNote}
                </p>
              ) : null}
              <button type="button" className="btn btn-quiet" onClick={downloadResume}>
                Download a résumé PDF of these details
              </button>
              <label className="ed-check">
                <input type="checkbox" checked={data.resumePhoto} onChange={(e) => set({ resumePhoto: e.target.checked })} />
                Put my photo on the résumé
              </label>
              <Choice<ResumeId>
                label="Résumé button on your portfolio"
                value={data.resume}
                options={RESUMES.filter((r) => r.id !== "original" || data.resumeFile)}
                onChange={(resume) => set({ resume })}
              />
              {data.resumeFile ? (
                <p className="ed-hint">
                  Uploaded file: {data.resumeName || "résumé.pdf"}.{" "}
                  <button type="button" className="ed-link" onClick={() => set({ resumeFile: "", resumeName: "", resume: data.resume === "original" ? "generated" : data.resume })}>
                    Remove it
                  </button>
                </p>
              ) : null}
              <p className="rs-disclaimer">
                <strong>Check before you send it.</strong> The résumé is made only from what you have entered here, so it
                is as accurate as your details. Read through names, dates and links before sharing it.
              </p>
            </div>
          </details>

          <details className="ed-group" open>
            <summary>About you</summary>
            <div className="ed-group-in">
              <ProfileFields data={data} tools={tools} />
            </div>
          </details>

          {data.sections.map((section, index) => (
            <details key={section.id} className="ed-group" open>
              <summary className="ed-sum">
                <span className="ed-sum-title">
                  {section.title || "Untitled section"}
                  {section.hidden ? <em> (hidden)</em> : null}
                </span>
                {/* Move the whole section. preventDefault stops the click from also folding it. */}
                <button
                  type="button"
                  className="ed-icon"
                  aria-label={`Move section ${section.title} up`}
                  disabled={index === 0}
                  onClick={(e) => { e.preventDefault(); set({ sections: move(data.sections, index, -1) }); }}
                >
                  ↑
                </button>
                <button
                  type="button"
                  className="ed-icon"
                  aria-label={`Move section ${section.title} down`}
                  disabled={index === data.sections.length - 1}
                  onClick={(e) => { e.preventDefault(); set({ sections: move(data.sections, index, 1) }); }}
                >
                  ↓
                </button>
              </summary>
              <div className="ed-group-in">
                <SectionFields data={data} section={section} tools={tools} design />
              </div>
            </details>
          ))}

          <details className="ed-group" open>
            <summary>Quote and contact</summary>
            <div className="ed-group-in">
              <ClosingFields data={data} set={set} />
            </div>
          </details>

          <div className="ed-foot">
            <button type="button" className="btn btn-outline" onClick={() => set({ sections: [...data.sections, newSection("New section", "list")] })}>
              + Add a section
            </button>
            <button type="button" className="ed-link" onClick={otherTemplates}>
              See these details in other templates
            </button>
            <button type="button" className="ed-link" onClick={() => startAnother(blankPortfolio(data.template))}>
              Start a new blank portfolio
            </button>
            <button type="button" className="ed-link" onClick={() => startAnother(fromSample(data.template))}>
              Start a new one from sample content
            </button>
          </div>
        </aside>

        <div className="ed-stage">
          <div className={phone && !preview ? "ed-frame is-phone" : "ed-frame"}>
            <PortfolioView
              key={`${preview}-${data.template}-${data.motion}`}
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { useRouter } from "next/navigation";
import ScaledPreview from "@/components/ScaledPreview";
import { ProfileFields, SectionFields } from "@/components/Fields";
import ResumeImport from "@/components/ResumeImport";
import BuildOwnBanner from "@/components/BuildOwnBanner";
import { READY_TEMPLATES } from "@/lib/templates";
import { blankPortfolio, inTemplate, newSection, type Portfolio } from "@/lib/portfolio";
import { usePortfolio } from "@/lib/usePortfolio";

// Keeps the user's own saved details; a saved sample person is replaced by an empty form.
function start(saved: Portfolio | null, template: string | undefined) {
  if (saved && !saved.sample) return saved;
  return blankPortfolio(template || "custom");
}

const HINTS: Record<string, string> = {
  Projects: "Things you built, wrote, designed or led. College projects count.",
  Experience: "Jobs, internships, freelance work and volunteering.",
  Education: "Degrees, school, courses and certificates.",
  Skills: "Tools, languages and strengths. Type them with commas in between.",
};

// The details form: one small step at a time, then a template picker that already shows the user's details.
// Everything is saved in this browser as it is typed, so the user can leave and come back.
export default function StartForm() {
  const router = useRouter();
  const tools = usePortfolio(start, { forgetTemplate: false });
  const { data, set, replaceWith, status } = tools;
  const [step, setStep] = useState(0);
  // Bumped after a résumé import, so the form fields show what was filled in.
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  if (!data) {
    return (
      <div className="ed-loading" role="status">
        Opening your details…
      </div>
    );
  }

  const steps = ["About you", ...data.sections.map((s) => s.title || "Section"), "Choose a look"];
  const last = steps.length - 1;
  const section = step > 0 && step < last ? data.sections[step - 1] : null;

  function choose(template: string) {
    if (!data) return;
    try {
      window.localStorage.removeItem("pv_template");
    } catch {
      // Storage can be blocked; nothing depends on this.
    }
    // Keep the look the user already built if they stay on the same template.
    set(template === data.template ? {} : inTemplate(data, template));
    // Give the save a moment to finish before the editor reads it.
    window.setTimeout(() => router.push("/editor"), 700);
  }

  return (
    <div className="sf">
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
        <Link href="/editor" className="btn btn-quiet">
          Skip to the editor
        </Link>
      </header>

      <nav className="wrap sf-steps" aria-label="Steps">
        {steps.map((name, i) => (
          <button
            key={i}
            type="button"
            className={i === step ? "sf-step is-on" : i < step ? "sf-step is-done" : "sf-step"}
            aria-current={i === step ? "step" : undefined}
            onClick={() => setStep(i)}
          >
            <span aria-hidden="true">{i + 1}</span>
            {name}
          </button>
        ))}
      </nav>

      {step < last ? (
        <main className="wrap sf-main">
          <h1 className="display h-section">{step === 0 ? "First, about you." : section?.title}</h1>
          <p className="sf-lead">
            {step === 0
              ? "Fill this in once. Every template will show these details straight away, and you can change anything later."
              : HINTS[section?.title ?? ""] ?? "Add as many entries as you like. You can add photos to each one."}{" "}
            Nothing here is required.
          </p>
          {step === 0 ? <ResumeImport data={data} set={set} replaceWith={replaceWith} onDone={() => setFilled((n) => n + 1)} /> : null}
          <div className="sf-card" key={`${step}-${filled}`}>
            {step === 0 ? <ProfileFields data={data} tools={tools} /> : null}
            {section ? <SectionFields data={data} section={section} tools={tools} design={false} /> : null}
          </div>
          {step === last - 1 ? (
            <button
              type="button"
              className="ed-link"
              onClick={() => {
                set({ sections: [...data.sections, newSection("New section", "list")] });
                setStep(step + 1);
              }}
            >
              + Add another section (awards, hobbies, anything)
            </button>
          ) : null}
          <div className="sf-nav">
            <button type="button" className="btn btn-outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
              {step === last - 1 ? "Next: choose a look" : "Next"}
            </button>
          </div>
        </main>
      ) : (
        <main className="wrap sf-main sf-wide">
          <h1 className="display h-section">Now choose a look.</h1>
          <p className="sf-lead">
            These are your details in every template. Pick one, or build your own from a blank canvas. You can switch
            at any time and mix parts of different templates in the editor.
          </p>
          <BuildOwnBanner
            action={
              <button type="button" className="btn btn-primary" onClick={() => choose("custom")}>
                Build your own
              </button>
            }
          />
          <div className="gallery-grid">
            {READY_TEMPLATES.map((t) => (
              <article key={t.id} className="tcard">
                <ScaledPreview id={t.id} data={data} />
                <div className="tcard-info">
                  <div className="tcard-name">{t.name}</div>
                  <div className="tcard-blurb">{t.blurb}</div>
                </div>
                <div className="tcard-actions">
                  <button type="button" className="btn btn-primary" onClick={() => choose(t.id)}>
                    Use this template
                  </button>
                </div>
              </article>
            ))}
          </div>
          <div className="sf-nav">
            <button type="button" className="btn btn-outline" onClick={() => setStep(step - 1)}>
              Back
            </button>
          </div>
        </main>
      )}
    </div>
  );
}

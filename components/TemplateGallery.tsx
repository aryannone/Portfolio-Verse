"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATES, type TemplateCategory } from "@/lib/templates";
import { useRouter } from "next/navigation";
import { forgetPickedTemplate, useDetails } from "@/lib/usePortfolio";
import { startNew } from "@/lib/store";
import ScaledPreview from "@/components/ScaledPreview";
import StartButton from "@/components/StartButton";
import BuildOwnBanner from "@/components/BuildOwnBanner";

type Group = Exclude<TemplateCategory, "custom">;
type Filter = "all" | Group;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
];

const GROUPS: { id: Group; label: string }[] = [
  { id: "professional", label: "PROFESSIONAL" },
  { id: "creative", label: "CREATIVE" },
];

export default function TemplateGallery() {
  const [filter, setFilter] = useState<Filter>("all");
  const router = useRouter();
  // Details and templates are independent: pick whose details to show, and every template shows them.
  const details = useDetails();
  const mine = details.data;

  async function addDetails() {
    // The portfolio open in the editor keeps its own place; the form starts empty.
    forgetPickedTemplate();
    await startNew(null);
    router.push("/start");
  }

  return (
    <>
      <div className="wrap details-pick">
        {details.items.length ? (
          <label>
            <span>Show the templates with</span>
            <select className="ed-input" value={details.chosen} onChange={(e) => details.choose(e.target.value)}>
              {details.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
              <option value="">Sample people</option>
            </select>
          </label>
        ) : null}
        <button type="button" className="btn btn-outline" onClick={addDetails}>
          + Add new details
        </button>
        {mine ? <p>Pick a template to save these details in it as a new portfolio. Your other portfolios stay as they are.</p> : null}
      </div>
      <div className="wrap own-wrap">
        <BuildOwnBanner action={<StartButton label="Build your own" template="custom" />} />
      </div>
      <div className="wrap filter-row" role="group" aria-label="Filter templates">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={filter === f.id ? "pill is-on" : "pill"}
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {GROUPS.filter((g) => filter === "all" || filter === g.id).map((g) => (
        <section key={g.id} className="wrap gallery-group">
          <h2 className="group-label">{g.label}</h2>
          <div className="gallery-grid">
            {TEMPLATES.filter((t) => t.category === g.id).map((t) => (
              <article key={t.id} className="tcard">
                <ScaledPreview id={t.id} data={mine} />
                <div className="tcard-info">
                  <div className="tcard-name">{t.name}</div>
                  <div className="tcard-blurb">{t.blurb}</div>
                </div>
                <div className="tcard-actions">
                  <Link href={`/templates/${t.id}`} className="btn btn-quiet">
                    Preview
                  </Link>
                  <StartButton label="Use this template" variant="outline" template={t.id} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

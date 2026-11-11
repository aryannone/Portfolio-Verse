"use client";

import { useState } from "react";
import { TEMPLATES, type TemplateCategory } from "@/lib/templates";
import TemplateThumb from "@/components/TemplateThumb";
import GoogleButton from "@/components/GoogleButton";

type Filter = "all" | TemplateCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
];

const GROUPS: { id: TemplateCategory; label: string }[] = [
  { id: "professional", label: "PROFESSIONAL" },
  { id: "creative", label: "CREATIVE" },
];

export default function TemplateGallery() {
  const [filter, setFilter] = useState<Filter>("all");

  return (
    <>
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
                <TemplateThumb id={t.id} />
                <div className="tcard-foot">
                  <div className="tcard-info">
                    <div className="tcard-name">{t.name}</div>
                    <div className="tcard-blurb">{t.blurb}</div>
                  </div>
                  <GoogleButton label="Use this template" variant="outline" template={t.id} />
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

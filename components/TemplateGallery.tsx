"use client";

import { useState } from "react";
import Link from "next/link";
import { TEMPLATES, type TemplateCategory } from "@/lib/templates";
import { useSavedDetails } from "@/lib/usePortfolio";
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
  // Once the user has filled in their details, every template shows them.
  const mine = useSavedDetails();

  return (
    <>
      {mine ? (
        <p className="wrap gallery-note" role="status">
          Showing your own details in every template. <Link href="/start">Edit your details</Link>
        </p>
      ) : null}
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

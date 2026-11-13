"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { READY_TEMPLATES, type TemplateCategory } from "@/lib/templates";
import { forgetPickedTemplate, useDetails } from "@/lib/usePortfolio";
import { startNew } from "@/lib/store";
import { BuildOwnCard, TemplateCard } from "@/components/TemplateCard";

type Filter = "all" | Exclude<TemplateCategory, "custom">;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "professional", label: "Professional" },
  { id: "creative", label: "Creative" },
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

  const shown = READY_TEMPLATES.filter((t) => filter === "all" || t.category === filter);
  const count = (f: Filter) => READY_TEMPLATES.filter((t) => f === "all" || t.category === f).length;

  return (
    <>
      <div className="wrap tg-toolbar">
        <div className="tg-tabs" role="group" aria-label="Filter templates">
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={filter === f.id ? "is-on" : ""} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
              <span aria-hidden="true">{count(f.id)}</span>
            </button>
          ))}
        </div>
        <div className="tg-details">
          {details.items.length ? (
            <label>
              <span>Shown with</span>
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
          <button type="button" className="btn btn-quiet" onClick={addDetails}>
            + Add new details
          </button>
        </div>
      </div>
      {mine ? (
        <p className="wrap tg-note">
          Showing <strong>{mine.name}</strong> in every template. Pick one to save these details in it as a new portfolio; your
          other portfolios stay as they are.
        </p>
      ) : null}

      <section className="wrap tg-grid" aria-label="Templates">
        <BuildOwnCard />
        {shown.map((t) => (
          <TemplateCard key={t.id} template={t} data={mine} />
        ))}
      </section>
    </>
  );
}

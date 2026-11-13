import type { CSSProperties } from "react";
import Link from "next/link";
import ScaledPreview from "@/components/ScaledPreview";
import StartButton from "@/components/StartButton";
import type { Portfolio } from "@/lib/portfolio";
import type { TemplateInfo } from "@/lib/templates";

const NEW = new Set(["case", "split", "bento"]);
const KIND: Record<string, string> = { professional: "Professional", creative: "Creative" };

// One template in a gallery: a live picture of it in a frame tinted with its own colour,
// its name and what it is for. The whole card opens the full preview.
// "compact" leaves out the "Use this template" button (for the home page).
export function TemplateCard({ template, data, compact = false }: { template: TemplateInfo; data?: Portfolio | null; compact?: boolean }) {
  return (
    <article className="tg-card" style={{ "--tg": template.accent } as CSSProperties}>
      <div className="tg-frame">
        <div className="tg-window">
          <div className="tg-bar" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <ScaledPreview id={template.id} data={data} ratio="4 / 3" flat width={1100} />
        </div>
      </div>
      <div className="tg-meta">
        <h3 className="tg-title">
          <Link href={`/templates/${template.id}`} className="tg-link">
            {template.name}
          </Link>
          {NEW.has(template.id) ? <span className="tg-new">New</span> : null}
        </h3>
        <span className="tg-tag">{KIND[template.category] ?? ""}</span>
      </div>
      <p className="tg-blurb">{template.blurb}</p>
      <div className="tg-actions">
        {compact ? null : <StartButton label="Use this template" variant="outline" template={template.id} />}
        <span className="tg-more" aria-hidden="true">
          Preview
        </span>
      </div>
    </article>
  );
}

// The first card: start from nothing. Its picture is a loop of a page being put together.
export function BuildOwnCard() {
  return (
    <article className="tg-card tg-own">
      <div className="tg-frame">
        <div className="tg-window">
          <div className="tg-bar" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="tg-own-art" aria-hidden="true">
            <div className="own-art">
              <span className="own-b own-b1" />
              <span className="own-b own-b2" />
              <span className="own-b own-b3" />
              <span className="own-b own-b4" />
              <span className="own-b own-b5" />
              <span className="own-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="own-pointer" />
            </div>
          </div>
        </div>
      </div>
      <div className="tg-meta">
        <h3 className="tg-title">Build your own</h3>
        <span className="tg-tag">Blank canvas</span>
      </div>
      <p className="tg-blurb">Add sections one by one and choose the colours, layouts and animation yourself.</p>
      <div className="tg-actions">
        <StartButton label="Start from blank" variant="outline" template="custom" />
      </div>
    </article>
  );
}

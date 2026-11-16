"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import TemplatePreview from "@/components/TemplatePreview";
import type { Portfolio } from "@/lib/portfolio";

const DESIGN_WIDTH = 1200;

// Shows a real template, drawn at laptop width and shrunk to fit its box.
// It is a picture of the template, so it is hidden from screen readers.
// "auto" makes the picture travel down the page by itself.
export default function ScaledPreview({
  id,
  ratio = "16 / 11",
  flat = false,
  auto = false,
  data,
  exact = false,
  width = DESIGN_WIDTH,
}: {
  id: string;
  ratio?: string;
  flat?: boolean;
  auto?: boolean;
  // The user's own details, shown in place of the sample person.
  data?: Portfolio | null;
  // Show that portfolio exactly as saved, not restyled into the template "id".
  exact?: boolean;
  // The width the page is drawn at before shrinking. Narrower makes the text in a small picture larger.
  width?: number;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ scale: number; viewHeight: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    // The size comes from the ResizeObserver, which reports it once on start and after every change.
    // Reading clientWidth here instead would force the browser to lay out the page early (a forced reflow),
    // once for every preview on the page.
    const observer = new ResizeObserver(([entry]) => {
      const { width: w, height: h } = entry.contentRect;
      if (!w) return;
      const scale = w / width;
      setSize({ scale, viewHeight: h / scale });
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [width]);

  const classes = ["scaled", flat ? "scaled-flat" : "", auto ? "scaled-auto" : ""].filter(Boolean).join(" ");

  return (
    // inert as well as hidden: the picture contains links, and the keyboard must not land on them.
    <div ref={boxRef} className={classes} style={{ aspectRatio: ratio }} aria-hidden="true" inert>
      <div
        className="scaled-inner"
        style={{ width, transform: `scale(${size?.scale ?? 0.3})`, opacity: size === null ? 0 : 1 }}
      >
        <div className="scaled-scroll" style={{ "--view-h": `${size?.viewHeight ?? 0}px` } as CSSProperties}>
          <TemplatePreview id={id} animate={auto} data={data} exact={exact} />
        </div>
      </div>
    </div>
  );
}

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
}: {
  id: string;
  ratio?: string;
  flat?: boolean;
  auto?: boolean;
  // The user's own details, shown in place of the sample person.
  data?: Portfolio | null;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ scale: number; viewHeight: number } | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => {
      const scale = box.clientWidth / DESIGN_WIDTH;
      setSize({ scale, viewHeight: box.clientHeight / scale });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  const classes = ["scaled", flat ? "scaled-flat" : "", auto ? "scaled-auto" : ""].filter(Boolean).join(" ");

  return (
    <div ref={boxRef} className={classes} style={{ aspectRatio: ratio }} aria-hidden="true">
      <div
        className="scaled-inner"
        style={{ transform: `scale(${size?.scale ?? 0.3})`, opacity: size === null ? 0 : 1 }}
      >
        <div className="scaled-scroll" style={{ "--view-h": `${size?.viewHeight ?? 0}px` } as CSSProperties}>
          <TemplatePreview id={id} animate={auto} data={data} />
        </div>
      </div>
    </div>
  );
}

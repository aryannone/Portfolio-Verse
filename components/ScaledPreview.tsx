"use client";

import { useEffect, useRef, useState } from "react";
import TemplatePreview from "@/components/TemplatePreview";

const DESIGN_WIDTH = 1200;

// Shows a real template, drawn at laptop width and shrunk to fit its box.
// It is a picture of the template, so it is hidden from screen readers.
export default function ScaledPreview({
  id,
  ratio = "16 / 11",
  flat = false,
}: {
  id: string;
  ratio?: string;
  flat?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const update = () => setScale(box.clientWidth / DESIGN_WIDTH);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={boxRef}
      className={flat ? "scaled scaled-flat" : "scaled"}
      style={{ aspectRatio: ratio }}
      aria-hidden="true"
    >
      <div
        className="scaled-inner"
        style={{ transform: `scale(${scale ?? 0.3})`, opacity: scale === null ? 0 : 1 }}
      >
        <TemplatePreview id={id} />
      </div>
    </div>
  );
}

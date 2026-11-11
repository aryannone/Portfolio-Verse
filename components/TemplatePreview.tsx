"use client";

import { useMemo } from "react";
import PortfolioView from "@/components/PortfolioView";
import { fromSample } from "@/lib/portfolio";

// A sample person's portfolio in the look of one template.
// "live" is the full page a visitor can scroll and tap; without it, it is only a picture.
export default function TemplatePreview({ id, live = false, animate = false }: { id: string; live?: boolean; animate?: boolean }) {
  const data = useMemo(() => fromSample(id), [id]);
  return <PortfolioView data={data} interactive={live} reveal={live} semantic={live} animate={live || animate} />;
}

"use client";

import { useMemo } from "react";
import PortfolioView from "@/components/PortfolioView";
import { fromSample, inTemplate, type Portfolio } from "@/lib/portfolio";
import { useSavedDetails } from "@/lib/usePortfolio";

type Props = {
  id: string;
  // The full page a visitor can scroll and tap. Without it, it is only a picture.
  live?: boolean;
  animate?: boolean;
  // The user's own details, to show in place of the sample person.
  data?: Portfolio | null;
  // Show the given portfolio exactly as it was saved, with its own template and look.
  exact?: boolean;
};

// One template, filled with the user's details when there are any, and a sample person when not.
export default function TemplatePreview({ id, live = false, animate = false, data, exact = false }: Props) {
  // A full page looks the details up itself; small pictures are handed them by their page.
  const saved = useSavedDetails();
  const details = data ?? (live ? saved : null);
  const shown = useMemo(() => {
    if (exact && data) return data;
    return details ? inTemplate(details, id) : fromSample(id);
  }, [exact, data, details, id]);
  return <PortfolioView key={details ? "mine" : "sample"} data={shown} interactive={live} reveal={live} semantic={live} animate={live || animate} />;
}

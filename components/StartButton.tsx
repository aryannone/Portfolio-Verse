"use client";

import { useRouter } from "next/navigation";
import { detailsKey, hasDetails, inTemplate } from "@/lib/portfolio";
import { loadPortfolio, loadSaved, openSaved, startNew } from "@/lib/store";
import { forgetPickedTemplate, pickDetails } from "@/lib/usePortfolio";

type Props = {
  label?: string;
  variant?: "primary" | "outline";
  template?: string;
};

// The way into the product. No account is needed for now.
//
// Without a template ("Start building"): new visitors fill in their details; returning ones go to the
// templates, which show their details.
//
// With a template ("Use this template"): the details the templates are showing are saved in that
// template as a new portfolio, so no other portfolio changes. If those details are already saved in
// that template, that portfolio is simply opened. With no details yet, the details form comes first.
export default function StartButton({ label = "Start building", variant = "primary", template }: Props) {
  const router = useRouter();

  async function start() {
    if (!template) {
      router.push(hasDetails(await loadPortfolio()) ? "/templates" : "/start");
      return;
    }

    const { items, current } = await loadSaved();
    const details = pickDetails(items, current);
    if (details) {
      forgetPickedTemplate();
      // These details may already be saved in this template; then that portfolio is opened, not copied.
      const key = detailsKey(details.data);
      const existing = items.find((item) => item.data.template === template && detailsKey(item.data) === key);
      if (existing) await openSaved(existing.id);
      else await startNew(inTemplate(details.data, template));
      router.push("/editor");
      return;
    }

    // No details chosen: an empty details form, which opens in this template when it is done.
    try {
      window.localStorage.setItem("pv_template", template);
    } catch {
      // Storage can be blocked; the template can be picked again later.
    }
    await startNew(null);
    router.push("/start");
  }

  return (
    <button
      type="button"
      className={variant === "primary" ? "btn btn-primary" : "btn btn-outline"}
      onClick={start}
    >
      {label}
    </button>
  );
}
